using Microsoft.AspNetCore.Mvc.Filters;
using YL.Helpers;
using YL.Models.Dtos.Commons;

namespace YL.Filters
{
	public class StockLoginRequiredAttribute : ActionFilterAttribute
	{
		public override void OnActionExecuting(ActionExecutingContext context)
		{
			var session = StockCookieHelper.GetSession(context.HttpContext.Request);

			if (session == null)
			{
				throw new CustomException(StockErrors.LoginRequired);
			}

			base.OnActionExecuting(context);
		}
	}
}
