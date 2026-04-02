using System.Text.Json.Serialization;

namespace YL.Models.Dtos.Webs
{
	public class AlbumInfo
	{
		[JsonPropertyName("albumId")]
		public int ALBUM_ID { get; set; }

		[JsonPropertyName("albumName")]
		public string ALBUM_NAME { get; set; } = string.Empty;

		[JsonPropertyName("displayName")]
		public string DISPLAY_NAME { get; set; } = string.Empty;

		[JsonPropertyName("createdDate")]
		public DateTime CREATED_DATE { get; set; }
	}
}
