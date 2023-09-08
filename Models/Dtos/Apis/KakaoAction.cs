using System.Text.Json.Serialization;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Newtonsoft.Json;

namespace YL.Models.Dtos.Apis
{
	public class KakaoAction
	{
		[JsonPropertyName("name")]
		public string Name { get; set; }

		[JsonPropertyName("params")]
		public Params Params { get; set; }
	}
}
