using System.Text.Json.Serialization;

namespace YL.Models.Dtos.Apis
{
	public class KakaoUser
	{
		[JsonPropertyName("properties")]
		public KakaoProperties Properties { get; set; }

		[JsonPropertyName("id")]
		public string Id { get; set; }

		[JsonPropertyName("type")]
		public string Type { get; set; }
	}
}
