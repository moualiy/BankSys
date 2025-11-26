namespace BankSystem.Data.Models;

public class Currency
{
    public int Id { get; set; }
    public string Code { get; set; }          // USD, EUR, GBP, etc.
    public string Name { get; set; }          // US Dollar, Euro, British Pound, etc.
    public string Country { get; set; }       // United States, European Union, United Kingdom, etc.
    public decimal Rate { get; set; }         // Exchange rate vs USD
}
