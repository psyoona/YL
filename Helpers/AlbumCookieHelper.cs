using System.Text.Json;
using YL.Configs;
using YL.Models.Dtos.Webs;
using YL.Services;

namespace YL.Helpers
{
	public static class AlbumCookieHelper
	{
		private const string CookieName = "AlbumAuth";
		private const int ExpirationHours = 1;

		public static void SetSession(HttpResponse response, AlbumSession session)
		{
			session.ExpiresAt = DateTimeOffset.UtcNow.AddHours(ExpirationHours).ToUnixTimeSeconds();

			string json = JsonSerializer.Serialize(session);
			string encrypted = new SecurityHelper().EncryptAes256(json, ConfigManager.Settings.AlbumEncryptionKey);

			response.Cookies.Append(CookieName, encrypted, new CookieOptions
			{
				HttpOnly = true,
				Secure = true,
				SameSite = SameSiteMode.Lax,
				MaxAge = TimeSpan.FromHours(ExpirationHours)
			});
		}

		public static AlbumSession? GetSession(HttpRequest request)
		{
			if (!request.Cookies.TryGetValue(CookieName, out string? encrypted) || string.IsNullOrEmpty(encrypted))
			{
				return null;
			}

			string json = new SecurityHelper().DecryptAes256(encrypted, ConfigManager.Settings.AlbumEncryptionKey);
			var session = JsonSerializer.Deserialize<AlbumSession>(json);

			if (session == null)
			{
				return null;
			}

			if (DateTimeOffset.UtcNow.ToUnixTimeSeconds() > session.ExpiresAt)
			{
				return null;
			}

			return session;
		}

		public static void ClearSession(HttpResponse response)
		{
			response.Cookies.Delete(CookieName);
		}
	}
}
