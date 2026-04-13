using System.Text.Json;
using YL.Configs;
using YL.Models.Dtos.Webs;

namespace YL.Helpers
{
	public static class StockCookieHelper
	{
		private const string CookieName = "StockAuth";
		private const int ExpirationHours = 4;

		public static void SetSession(HttpResponse response, StockSession session)
		{
			session.ExpiresAt = DateTimeOffset.UtcNow.AddHours(ExpirationHours).ToUnixTimeSeconds();

			string json = JsonSerializer.Serialize(session);
			string encrypted = new SecurityHelper().EncryptAes256(json, ConfigManager.Settings.StockEncryptionKey);

			response.Cookies.Append(CookieName, encrypted, new CookieOptions
			{
				HttpOnly = true,
				Secure = true,
				SameSite = SameSiteMode.Lax,
				MaxAge = TimeSpan.FromHours(ExpirationHours)
			});
		}

		public static StockSession? GetSession(HttpRequest request)
		{
			if (!request.Cookies.TryGetValue(CookieName, out string? encrypted) || string.IsNullOrEmpty(encrypted))
			{
				return null;
			}

			string json = new SecurityHelper().DecryptAes256(encrypted, ConfigManager.Settings.StockEncryptionKey);
			var session = JsonSerializer.Deserialize<StockSession>(json);

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
