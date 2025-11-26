using BankSystem.Data.Models;
using System.Net.Http;
using System.Threading.Tasks;
using System.Text.Json;
using System.Collections.Generic;
using System.Linq;

namespace BankSystem.Business.Services;

public class CurrencyService
{
    private const string API_KEY = "9b17a9c2a2e7fa0c7f7d6b43";
    private const string BASE_URL = "https://v6.exchangerate-api.com/v6";

    public async Task<List<Currency>> GetAllCurrencies()
    {
        try
        {
            using (var client = new HttpClient())
            {
                // Call the external API to get all supported currency codes
                var response = await client.GetAsync($"{BASE_URL}/{API_KEY}/codes");
                
                if (!response.IsSuccessStatusCode)
                {
                    // Fallback to hardcoded data if API fails
                    return GetFallbackCurrencies();
                }

                var json = await response.Content.ReadAsStringAsync();
                
                // Parse the JSON response
                using (JsonDocument doc = JsonDocument.Parse(json))
                {
                    var root = doc.RootElement;
                    
                    if (root.GetProperty("result").GetString() != "success")
                    {
                        return GetFallbackCurrencies();
                    }

                    var currencies = new List<Currency>();
                    var supportedCodes = root.GetProperty("supported_codes").EnumerateArray();

                    int id = 1;
                    foreach (var codeArray in supportedCodes)
                    {
                        var codeStr = codeArray[0].GetString();
                        var nameStr = codeArray[1].GetString();

                        // Get the rate for this currency
                        var rate = await GetExchangeRate(codeStr);

                        currencies.Add(new Currency
                        {
                            Id = id++,
                            Code = codeStr,
                            Name = nameStr,
                            Country = nameStr, // Using name as country for now
                            Rate = rate
                        });
                    }

                    return currencies;
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error fetching currencies: {ex.Message}");
            // Return hardcoded data as fallback
            return GetFallbackCurrencies();
        }
    }

    private async Task<decimal> GetExchangeRate(string currencyCode)
    {
        try
        {
            using (var client = new HttpClient())
            {
                // Get exchange rate for this currency vs USD
                var response = await client.GetAsync($"{BASE_URL}/{API_KEY}/latest/USD");
                
                if (!response.IsSuccessStatusCode)
                {
                    return 1.0m;
                }

                var json = await response.Content.ReadAsStringAsync();
                
                using (JsonDocument doc = JsonDocument.Parse(json))
                {
                    var root = doc.RootElement;
                    
                    if (root.TryGetProperty("conversion_rates", out var rates))
                    {
                        if (rates.TryGetProperty(currencyCode, out var rateElement))
                        {
                            return (decimal)rateElement.GetDouble();
                        }
                    }
                }
            }
        }
        catch
        {
            // If we can't get the rate, return 1.0
        }

        return 1.0m;
    }

    private List<Currency> GetFallbackCurrencies()
    {
        return new List<Currency>
        {
            new Currency { Id = 1, Code = "USD", Name = "US Dollar", Country = "United States", Rate = 1.0m },
            new Currency { Id = 2, Code = "EUR", Name = "Euro", Country = "European Union", Rate = 0.92m },
            new Currency { Id = 3, Code = "GBP", Name = "British Pound", Country = "United Kingdom", Rate = 0.79m },
            new Currency { Id = 4, Code = "JPY", Name = "Japanese Yen", Country = "Japan", Rate = 149.50m },
            new Currency { Id = 5, Code = "CHF", Name = "Swiss Franc", Country = "Switzerland", Rate = 0.88m },
            new Currency { Id = 6, Code = "CAD", Name = "Canadian Dollar", Country = "Canada", Rate = 1.36m },
            new Currency { Id = 7, Code = "AUD", Name = "Australian Dollar", Country = "Australia", Rate = 1.52m },
            new Currency { Id = 8, Code = "CNY", Name = "Chinese Yuan", Country = "China", Rate = 7.24m },
            new Currency { Id = 9, Code = "INR", Name = "Indian Rupee", Country = "India", Rate = 83.12m },
            new Currency { Id = 10, Code = "BRL", Name = "Brazilian Real", Country = "Brazil", Rate = 4.97m },
        };
    }
}
