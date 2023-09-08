using System.Text.Json.Serialization;

namespace YL.Models.Dtos.Apis
{
	public class KakaoUserRequest
	{
		[JsonPropertyName("utterance")]
		public string Utterance { get; set; }
	}
}
