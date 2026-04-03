using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Unicode;
using YL.Models.Dtos.Commons;

namespace YL.Handlers
{
	public class ErrorHandlerMiddleware
	{
		public ErrorHandlerMiddleware(RequestDelegate next)
		{
			Next = next;
		}

		private RequestDelegate Next { get; }

		public async Task Invoke(HttpContext context)
		{
			try
			{
				await Next(context);
			}
			catch (Exception exception)
			{
				HttpResponse response = context.Response;
				response.ContentType = "application/json";
				string result = string.Empty;

				JsonSerializerOptions options = new JsonSerializerOptions();
				options.Encoder = JavaScriptEncoder.Create(UnicodeRanges.All);
				options.WriteIndented = true;

				if (context.Request.RouteValues["controller"].ToString().ToLower().Contains("kakaoapi"))
				{
					result = JsonSerializer.Serialize(new { answer = new { status = "normal", sentence = exception.Message, dialog = "finish" } }, options);
				}
				else if (exception is CustomException customException)
				{
					result = JsonSerializer.Serialize(new { success = false, code = customException.Code, message = customException.CustomMessage }, options);
				}
				else
				{
					result = JsonSerializer.Serialize(new { success = false, message = exception.Message }, options);
				}

				await response.WriteAsync(result);
			}
		}
	}
}
