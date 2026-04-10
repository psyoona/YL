using System.Text.Json.Serialization;

namespace YL.Models.Dtos.Webs
{
	public class HoldingInfo
	{
		[JsonPropertyName("id")]
		public int ID { get; set; }

		[JsonPropertyName("stockCode")]
		public string STOCK_CODE { get; set; } = string.Empty;

		[JsonPropertyName("stockName")]
		public string STOCK_NAME { get; set; } = string.Empty;

		[JsonPropertyName("quantity")]
		public int QUANTITY { get; set; }

		[JsonPropertyName("avgBuyPrice")]
		public decimal AVG_BUY_PRICE { get; set; }

		[JsonPropertyName("currentPrice")]
		public decimal? CURRENT_PRICE { get; set; }

		[JsonPropertyName("profitLossRate")]
		public decimal? PROFIT_LOSS_RATE { get; set; }

		[JsonPropertyName("boughtAt")]
		public DateTime BOUGHT_AT { get; set; }

		[JsonPropertyName("updatedAt")]
		public DateTime UPDATED_AT { get; set; }
	}
}
