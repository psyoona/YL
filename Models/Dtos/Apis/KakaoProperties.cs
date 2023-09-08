using System.Text.Json.Serialization;

namespace YL.Models.Dtos.Apis
{
	public class KakaoProperties
	{
		[JsonPropertyName("appUserId")]
		public string AppUserId { get; set; }

		[JsonPropertyName("appUserStatus")]
		public string AppUserStatus { get; set; }

		[JsonPropertyName("botUserKey")]
		public string BotUserKey { get; set; }
	}
}
