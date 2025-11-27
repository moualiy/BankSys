namespace BankSystem.Data.Models;

public class Currency
{
    public int Id { get; set; }
    public string Code { get; set; } = null!;          // USD, EUR, GBP, etc.
    public string Name { get; set; } = null!;          // US Dollar, Euro, British Pound, etc.
    public string Country { get; set; } = null!;       // United States, European Union, United Kingdom, etc.
    public decimal Rate { get; set; }         // Exchange rate vs USD

    public Currency()
    {
        Code = string.Empty;
        Name = string.Empty;
        Country = string.Empty;
    }
}
