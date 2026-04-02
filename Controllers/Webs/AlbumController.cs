using Microsoft.AspNetCore.Mvc;
using YL.Models.Dtos.Webs;
using YL.Services;

namespace YL.Controllers.Webs
{
	public class AlbumController : BaseController
	{
		public AlbumController() { }

		private bool IsLoggedIn()
		{
			return HttpContext.Session.GetString("AlbumUserPhone") != null;
		}

		private bool IsSystemMaster()
		{
			return HttpContext.Session.GetString("AlbumIsSystemMaster") == "true";
		}

		private List<string> GetSessionRoleNames()
		{
			string roles = HttpContext.Session.GetString("AlbumUserRoles") ?? "";
			return roles.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList();
		}

		private List<int> GetSessionRoleIds()
		{
			string ids = HttpContext.Session.GetString("AlbumUserRoleIds") ?? "";
			return ids.Split(',', StringSplitOptions.RemoveEmptyEntries)
				.Select(s => int.TryParse(s, out int id) ? id : 0)
				.Where(id => id > 0)
				.ToList();
		}

		// ============================================
		// 인증
		// ============================================

		[HttpGet]
		public ActionResult Login()
		{
			this.Initialize();

			if (IsLoggedIn())
			{
				return RedirectToAction("Index");
			}

			return this.View();
		}

		[HttpPost]
		public JsonResult Authenticate(string phoneNumber, string password)
		{
			try
			{
				var service = new AlbumService();
				AlbumUser result = service.Login(phoneNumber, password);

				if (result.IsValid)
				{
					HttpContext.Session.SetString("AlbumUserPhone", phoneNumber);
					HttpContext.Session.SetString("AlbumUserName", result.UserName);

					// 역할 정보 저장
					try
					{
						var roles = service.GetUserRoles(phoneNumber);
						var roleNames = roles.Select(r => r.ROLE_NAME).ToList();
						var roleIds = roles.Select(r => r.ROLE_ID).ToList();

						HttpContext.Session.SetString("AlbumUserRoles", string.Join(",", roleNames));
						HttpContext.Session.SetString("AlbumUserRoleIds", string.Join(",", roleIds));
						HttpContext.Session.SetString("AlbumIsSystemMaster",
							roleNames.Contains(AlbumService.SystemMasterRole) ? "true" : "false");
					}
					catch
					{
						HttpContext.Session.SetString("AlbumUserRoles", "");
						HttpContext.Session.SetString("AlbumUserRoleIds", "");
						HttpContext.Session.SetString("AlbumIsSystemMaster", "false");
					}
				}

				return this.Json(new { success = result.IsValid, userName = result.UserName });
			}
			catch (Exception)
			{
				return this.Json(new { success = false, userName = "", error = "서버 오류가 발생했습니다." });
			}
		}

		[HttpGet]
		public ActionResult Logout()
		{
			HttpContext.Session.Remove("AlbumUserPhone");
			HttpContext.Session.Remove("AlbumUserName");
			HttpContext.Session.Remove("AlbumUserRoles");
			HttpContext.Session.Remove("AlbumUserRoleIds");
			HttpContext.Session.Remove("AlbumIsSystemMaster");

			return RedirectToAction("Login");
		}

		// ============================================
		// 메인 페이지
		// ============================================

		[HttpGet]
		public ActionResult Index()
		{
			this.Initialize();

			if (!IsLoggedIn())
			{
				return RedirectToAction("Login");
			}

			ViewBag.UserName = HttpContext.Session.GetString("AlbumUserName");
			ViewBag.IsSystemMaster = IsSystemMaster();

			return this.View();
		}

		// ============================================
		// 앨범 목록 (접근 권한 필터링)
		// ============================================

		[HttpPost]
		public JsonResult GetAlbumList()
		{
			if (!IsLoggedIn())
			{
				return this.Json(new { message = "로그인이 필요합니다." });
			}

			var service = new AlbumService();
			var roleNames = GetSessionRoleNames();
			var roleIds = GetSessionRoleIds();

			List<string> albums = service.GetAccessibleAlbumNames(roleNames, roleIds);

			return this.Json(new { albums });
		}

		// ============================================
		// 사진 관련
		// ============================================

		[HttpPost]
		public JsonResult GetPhotoList(string albumName)
		{
			if (!IsLoggedIn())
			{
				return this.Json(new { message = "로그인이 필요합니다." });
			}

			if (!HasAccess(albumName))
			{
				return this.Json(new { photos = new List<AlbumPhoto>(), error = "접근 권한이 없습니다." });
			}

			try
			{
				List<AlbumPhoto> photos = new AlbumService().GetPhotoList(albumName);

				return this.Json(new { photos });
			}
			catch (Exception ex)
			{
				return this.Json(new { photos = new List<AlbumPhoto>(), error = ex.Message });
			}
		}

		[HttpGet]
		[ResponseCache(Duration = 86400, Location = ResponseCacheLocation.Client)]
		public ActionResult GetPhoto(string albumName, string fileName)
		{
			if (!IsLoggedIn())
			{
				return Unauthorized();
			}

			if (!HasAccess(albumName))
			{
				return Forbid();
			}

			var result = new AlbumService().GetPhoto(albumName, fileName);

			if (result == null)
			{
				return NotFound();
			}

			return File(result.Value.data, result.Value.contentType);
		}

		[HttpGet]
		[ResponseCache(Duration = 86400, Location = ResponseCacheLocation.Client)]
		public ActionResult GetThumbnail(string albumName, string fileName)
		{
			if (!IsLoggedIn())
			{
				return Unauthorized();
			}

			if (!HasAccess(albumName))
			{
				return Forbid();
			}

			var result = new AlbumService().GetThumbnail(albumName, fileName);

			if (result == null)
			{
				return NotFound();
			}

			return File(result.Value.data, result.Value.contentType);
		}

		[HttpPost]
		[RequestSizeLimit(50_000_000)]
		public JsonResult UploadPhotos(string albumName, List<IFormFile> files)
		{
			if (!IsLoggedIn())
			{
				return this.Json(new { message = "로그인이 필요합니다." });
			}

			if (!HasAccess(albumName))
			{
				return this.Json(new { success = false, error = "접근 권한이 없습니다." });
			}

			try
			{
				var service = new AlbumService();
				var uploaded = new List<AlbumPhoto>();

				foreach (var file in files)
				{
					if (file.Length > 0)
					{
						var photo = service.UploadPhoto(albumName, file);
						uploaded.Add(photo);
					}
				}

				return this.Json(new { success = true, photos = uploaded });
			}
			catch (Exception ex)
			{
				return this.Json(new { success = false, error = ex.Message });
			}
		}

		[HttpPost]
		public JsonResult DeletePhoto(string albumName, string fileName, int photoId)
		{
			if (!IsLoggedIn())
			{
				return this.Json(new { message = "로그인이 필요합니다." });
			}

			if (!HasAccess(albumName))
			{
				return this.Json(new { success = false, error = "접근 권한이 없습니다." });
			}

			try
			{
				bool result = new AlbumService().DeletePhoto(albumName, fileName, photoId);

				return this.Json(new { success = result });
			}
			catch (Exception)
			{
				return this.Json(new { success = false, error = "삭제 중 오류가 발생했습니다." });
			}
		}

		[HttpPost]
		public JsonResult SyncPhotos(string albumName)
		{
			if (!IsLoggedIn())
			{
				return this.Json(new { message = "로그인이 필요합니다." });
			}

			if (!HasAccess(albumName))
			{
				return this.Json(new { success = false, error = "접근 권한이 없습니다." });
			}

			try
			{
				List<AlbumPhoto> photos = new AlbumService().SyncAlbumMetadata(albumName);

				return this.Json(new { success = true, count = photos.Count, photos });
			}
			catch (Exception ex)
			{
				return this.Json(new { success = false, error = ex.Message });
			}
		}

		// ============================================
		// 앨범 관리 (시스템 마스터 전용)
		// ============================================

		[HttpPost]
		public JsonResult CreateAlbum(string albumName)
		{
			if (!IsLoggedIn() || !IsSystemMaster())
			{
				return this.Json(new { success = false, error = "권한이 없습니다." });
			}

			try
			{
				bool result = new AlbumService().CreateAlbum(albumName);

				return this.Json(new { success = result, error = result ? "" : "앨범 생성에 실패했습니다. 이미 존재하거나 유효하지 않은 이름입니다." });
			}
			catch (Exception ex)
			{
				return this.Json(new { success = false, error = ex.Message });
			}
		}

		[HttpPost]
		public JsonResult DeleteAlbum(string albumName)
		{
			if (!IsLoggedIn() || !IsSystemMaster())
			{
				return this.Json(new { success = false, error = "권한이 없습니다." });
			}

			try
			{
				bool result = new AlbumService().DeleteAlbum(albumName);

				return this.Json(new { success = result, error = result ? "" : "앨범 삭제에 실패했습니다." });
			}
			catch (Exception ex)
			{
				return this.Json(new { success = false, error = ex.Message });
			}
		}

		// ============================================
		// 관리자 페이지 (시스템 마스터 전용)
		// ============================================

		[HttpGet]
		public ActionResult Admin()
		{
			this.Initialize();

			if (!IsLoggedIn())
			{
				return RedirectToAction("Login");
			}

			if (!IsSystemMaster())
			{
				return RedirectToAction("Index");
			}

			ViewBag.UserName = HttpContext.Session.GetString("AlbumUserName");

			return this.View();
		}

		[HttpPost]
		public JsonResult GetRoles()
		{
			if (!IsLoggedIn() || !IsSystemMaster())
			{
				return this.Json(new { success = false, error = "권한이 없습니다." });
			}

			var roles = new AlbumService().GetAllRoles();
			return this.Json(new { success = true, roles });
		}

		[HttpPost]
		public JsonResult AddRole(string roleName)
		{
			if (!IsLoggedIn() || !IsSystemMaster())
			{
				return this.Json(new { success = false, error = "권한이 없습니다." });
			}

			bool result = new AlbumService().AddRole(roleName);
			return this.Json(new { success = result, error = result ? "" : "이미 존재하는 역할입니다." });
		}

		[HttpPost]
		public JsonResult DeleteRole(int roleId)
		{
			if (!IsLoggedIn() || !IsSystemMaster())
			{
				return this.Json(new { success = false, error = "권한이 없습니다." });
			}

			bool result = new AlbumService().DeleteRole(roleId);
			return this.Json(new { success = result, error = result ? "" : "시스템 마스터 역할은 삭제할 수 없습니다." });
		}

		[HttpPost]
		public JsonResult GetUsers()
		{
			if (!IsLoggedIn() || !IsSystemMaster())
			{
				return this.Json(new { success = false, error = "권한이 없습니다." });
			}

			var users = new AlbumService().GetAllUsers();
			var userRoles = new AlbumService().GetAllUserRoles();
			return this.Json(new { success = true, users, userRoles });
		}

		[HttpPost]
		public JsonResult AssignUserRole(string phoneNumber, int roleId)
		{
			if (!IsLoggedIn() || !IsSystemMaster())
			{
				return this.Json(new { success = false, error = "권한이 없습니다." });
			}

			bool result = new AlbumService().AssignUserRole(phoneNumber, roleId);
			return this.Json(new { success = result, error = result ? "" : "이미 할당된 역할입니다." });
		}

		[HttpPost]
		public JsonResult RemoveUserRole(int userRoleId)
		{
			if (!IsLoggedIn() || !IsSystemMaster())
			{
				return this.Json(new { success = false, error = "권한이 없습니다." });
			}

			bool result = new AlbumService().RemoveUserRole(userRoleId);
			return this.Json(new { success = result });
		}

		[HttpPost]
		public JsonResult GetAlbumAccess()
		{
			if (!IsLoggedIn() || !IsSystemMaster())
			{
				return this.Json(new { success = false, error = "권한이 없습니다." });
			}

			var accessList = new AlbumService().GetAllAlbumAccess();
			var albums = new AlbumService().GetAlbumList();
			var roles = new AlbumService().GetAllRoles();
			return this.Json(new { success = true, accessList, albums, roles });
		}

		[HttpPost]
		public JsonResult AddAlbumAccess(string albumName, int roleId)
		{
			if (!IsLoggedIn() || !IsSystemMaster())
			{
				return this.Json(new { success = false, error = "권한이 없습니다." });
			}

			bool result = new AlbumService().AddAlbumAccess(albumName, roleId);
			return this.Json(new { success = result, error = result ? "" : "이미 설정된 접근 권한입니다." });
		}

		[HttpPost]
		public JsonResult RemoveAlbumAccess(int accessId)
		{
			if (!IsLoggedIn() || !IsSystemMaster())
			{
				return this.Json(new { success = false, error = "권한이 없습니다." });
			}

			bool result = new AlbumService().RemoveAlbumAccess(accessId);
			return this.Json(new { success = result });
		}

		// ============================================
		// 헬퍼
		// ============================================

		private bool HasAccess(string albumName)
		{
			var service = new AlbumService();
			var roleNames = GetSessionRoleNames();
			var roleIds = GetSessionRoleIds();

			return service.HasAlbumAccess(albumName, roleNames, roleIds);
		}
	}
}
