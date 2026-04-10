using System.Text.Json.Serialization;

namespace YL.Models.Dtos.Webs
{
	public class StockInfo
	{
		[JsonPropertyName("stockCode")]
		public string STOCK_CODE { get; set; } = string.Empty;

		[JsonPropertyName("stockName")]
		public string STOCK_NAME { get; set; } = string.Empty;

		[JsonPropertyName("marketType")]
		public string MARKET_TYPE { get; set; } = string.Empty;

		[JsonPropertyName("isActive")]
		public bool IS_ACTIVE { get; set; }

		[JsonPropertyName("isWatchList")]
		public bool IS_WATCH_LIST { get; set; }

		[JsonPropertyName("createdAt")]
		public DateTime CREATED_AT { get; set; }

		[JsonPropertyName("updatedAt")]
		public DateTime UPDATED_AT { get; set; }
	}
}
