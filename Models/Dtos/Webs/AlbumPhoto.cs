using System.Text.Json.Serialization;

namespace YL.Models.Dtos.Webs
{
	public class AlbumPhoto
	{
		[JsonPropertyName("photoId")]
		public int PHOTO_ID { get; set; }

		[JsonPropertyName("albumName")]
		public string ALBUM_NAME { get; set; } = string.Empty;

		[JsonPropertyName("fileName")]
		public string FILE_NAME { get; set; } = string.Empty;

		[JsonPropertyName("width")]
		public int WIDTH { get; set; }

		[JsonPropertyName("height")]
		public int HEIGHT { get; set; }

		[JsonPropertyName("fileSize")]
		public long FILE_SIZE { get; set; }

		[JsonPropertyName("displayOrder")]
		public int DISPLAY_ORDER { get; set; }
	}
}
