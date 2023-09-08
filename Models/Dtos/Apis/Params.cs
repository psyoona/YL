using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Identity;

namespace YL.Models.Dtos.Apis
{
	public class Params
	{
		[JsonPropertyName("user_key")]
		public string UserKey { get; set; }

		[JsonPropertyName("type")]
		public string Type { get; set; }

		[JsonPropertyName("content")]
		public string Content { get; set; }
	}
}
