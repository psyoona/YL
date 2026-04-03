using Microsoft.AspNetCore.Mvc.Filters;
using YL.Helpers;
using YL.Models.Dtos.Commons;

namespace YL.Filters
{
	public class AlbumLoginRequiredAttribute : ActionFilterAttribute
	{
		public override void OnActionExecuting(ActionExecutingContext context)
		{
			var session = AlbumCookieHelper.GetSession(context.HttpContext.Request);

			if (session == null)
			{
				throw new CustomException(AlbumErrors.LoginRequired);
			}

			base.OnActionExecuting(context);
		}
	}
}
