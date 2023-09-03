using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Unicode;
using YL.Models.Functions;

namespace YL.Models.Handlers
{
	public class ErrorHandlerMiddleware
	{
		public ErrorHandlerMiddleware(RequestDelegate next)
		{
			this.Next = next;
		}

		private RequestDelegate Next { get; }

		public async Task Invoke(HttpContext context)
		{
			try
			{
				await this.Next(context);
			}
			catch (Exception exception)
			{
				HttpResponse response = context.Response;
				response.ContentType = "application/json";

				JsonSerializerOptions options = new JsonSerializerOptions();
				options.Encoder = JavaScriptEncoder.Create(UnicodeRanges.All);
				options.WriteIndented = true;

				if (context.Request.RouteValues["controller"].ToString().ToLower().Contains("api"))
				{
					options.PropertyNamingPolicy = new UpperCaseNamingPolicy();
				}

				string message = string.Empty;

				string result = JsonSerializer.Serialize(new { success = false, message = message }, options);

				await response.WriteAsync(result);
			}
		}
	}
}
