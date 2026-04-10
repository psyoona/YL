using System.Text.Json.Serialization;

namespace YL.Models.Dtos.Webs
{
	public class TradeLogInfo
	{
		[JsonPropertyName("id")]
		public int ID { get; set; }

		[JsonPropertyName("logLevel")]
		public string LOG_LEVEL { get; set; } = string.Empty;

		[JsonPropertyName("message")]
		public string MESSAGE { get; set; } = string.Empty;

		[JsonPropertyName("stockCode")]
		public string STOCK_CODE { get; set; } = string.Empty;

		[JsonPropertyName("orderId")]
		public int? ORDER_ID { get; set; }

		[JsonPropertyName("createdAt")]
		public DateTime CREATED_AT { get; set; }
	}
}
