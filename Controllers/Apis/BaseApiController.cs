using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using YL.Models.Functions;

namespace YL.Controllers.Apis
{
	public class BaseApiController : Controller
	{
		public BaseApiController(IConfiguration configuration)
		{
			if (CustomConfig.AppSettings == null)
			{
				CustomConfig.AppSettings = configuration;
			}
		}

		public JsonSerializerOptions JsonSerializerOptions
		{
			get
			{
				JsonSerializerOptions options = new JsonSerializerOptions()
				{ 
					PropertyNamingPolicy = new UpperCaseNamingPolicy(),
					WriteIndented = true
				};

				return options;
			}
		}

		public override void OnActionExecuting(ActionExecutingContext context)
		{
			HttpRequest currentRequest = context.HttpContext.Request;

			if (currentRequest.Method == "POST")
			{

			}
		}
	}
}
