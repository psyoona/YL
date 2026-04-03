using System.Text.Json;

namespace YL.Helpers
{
	public static class LocaleHelper
	{
		private const string DefaultLocale = "ko";
		private static readonly string[] SupportedLocales = { "ko", "en" };
		private static readonly Dictionary<string, Dictionary<string, string>> Cache = new();
		private static string _basePath = string.Empty;

		public static void Initialize(string webRootPath)
		{
			_basePath = Path.Combine(webRootPath, "locales");

			foreach (var locale in SupportedLocales)
			{
				Load(locale);
			}
		}

		private static void Load(string locale)
		{
			string filePath = Path.Combine(_basePath, $"{locale}.json");

			if (!File.Exists(filePath))
			{
				return;
			}

			string json = File.ReadAllText(filePath);
			var messages = JsonSerializer.Deserialize<Dictionary<string, string>>(json);

			if (messages != null)
			{
				Cache[locale] = messages;
			}
		}

		public static string GetMessage(int code, string? locale = null)
		{
			locale = ResolveLocale(locale);

			if (Cache.TryGetValue(locale, out var messages) && messages.TryGetValue(code.ToString(), out var message))
			{
				return message;
			}

			if (locale != DefaultLocale && Cache.TryGetValue(DefaultLocale, out var fallback) && fallback.TryGetValue(code.ToString(), out var fallbackMessage))
			{
				return fallbackMessage;
			}

			return $"Unknown error ({code})";
		}

		public static string ResolveLocale(string? locale)
		{
			if (string.IsNullOrEmpty(locale))
			{
				return DefaultLocale;
			}

			if (locale.Length > 2)
			{
				locale = locale[..2];
			}

			locale = locale.ToLower();

			return SupportedLocales.Contains(locale) ? locale : DefaultLocale;
		}

		public static string GetLocaleFromRequest(HttpRequest request)
		{
			var acceptLanguage = request.Headers.AcceptLanguage.ToString();

			if (string.IsNullOrEmpty(acceptLanguage))
			{
				return DefaultLocale;
			}

			var primaryLanguage = acceptLanguage.Split(',').FirstOrDefault()?.Trim();

			return ResolveLocale(primaryLanguage);
		}
	}
}
