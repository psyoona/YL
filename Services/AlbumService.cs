using System.Security.Cryptography;
using System.Text;
using SkiaSharp;
using YL.Configs;
using YL.Models.Daos;
using YL.Models.Dtos.Webs;

namespace YL.Services
{
	public class AlbumService
	{
		private readonly string _albumBasePath;
		private readonly string _thumbnailCachePath;
		private const int ThumbnailMaxWidth = 1200;
		private const int ThumbnailMaxHeight = 900;
		private const int ThumbnailQuality = 95;

		private static readonly string[] ImageExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp" };

		public const string SystemMasterRole = "시스템 마스터";

		public AlbumService()
		{
			_albumBasePath = Path.Combine(ConfigManager.Settings.ServiceBasePath, "albums");
			_thumbnailCachePath = Path.Combine(ConfigManager.Settings.ServiceBasePath, "albums", ".thumbnails");
		}

		public string GetAlbumBasePath()
		{
			return _albumBasePath;
		}

		// ============================================
		// 인증
		// ============================================

		public AlbumUser Login(string phoneNumber, string password)
		{
			string passwordHash = ComputeSha256Hash(password);
			return new AlbumDao().Login(phoneNumber, passwordHash);
		}

		// ============================================
		// 역할/권한
		// ============================================

		public List<AlbumRole> GetUserRoles(string phoneNumber)
		{
			return new AlbumDao().GetUserRoles(phoneNumber);
		}

		public bool IsSystemMaster(List<string> roleNames)
		{
			return roleNames.Contains(SystemMasterRole);
		}

		public bool HasAlbumAccess(string albumName, List<string> roleNames, List<int> roleIds)
		{
			if (this.IsSystemMaster(roleNames))
			{
				return true;
			}

			var accessList = new AlbumDao().GetAllAlbumAccess();
			var albumAccess = accessList.Where(a => a.ALBUM_NAME == albumName).ToList();

			// 접근 규칙이 없는 앨범은 모든 로그인 사용자에게 허용
			if (albumAccess.Count == 0)
			{
				return true;
			}

			// 사용자의 역할 중 하나라도 접근 허용 역할에 포함되면 접근 허용
			return albumAccess.Any(a => roleIds.Contains(a.ROLE_ID));
		}

		public List<string> GetAccessibleAlbumNames(List<string> roleNames, List<int> roleIds)
		{
			var allAlbums = this.GetAlbumList();

			if (this.IsSystemMaster(roleNames))
			{
				return allAlbums;
			}

			var accessList = new AlbumDao().GetAllAlbumAccess();

			return allAlbums.Where(albumName =>
			{
				var albumAccess = accessList.Where(a => a.ALBUM_NAME == albumName).ToList();

				if (albumAccess.Count == 0)
					return true;

				return albumAccess.Any(a => roleIds.Contains(a.ROLE_ID));
			}).ToList();
		}

		// ============================================
		// 앨범 목록
		// ============================================

		public List<string> GetAlbumList()
		{
			List<string> albums = new List<string>();

			if (Directory.Exists(_albumBasePath))
			{
				var directories = Directory.GetDirectories(_albumBasePath)
					.Select(d => Path.GetFileName(d))
					.Where(d => !d.StartsWith("."))
					.OrderBy(d => d)
					.ToList();

				albums.AddRange(directories);
			}

			return albums;
		}

		// ============================================
		// 앨범 관리
		// ============================================

		public bool CreateAlbum(string albumName)
		{
			if (string.IsNullOrWhiteSpace(albumName))
				return false;

			// 폴더명에 사용할 수 없는 문자 체크
			if (albumName.IndexOfAny(Path.GetInvalidFileNameChars()) >= 0)
				return false;

			if (albumName.StartsWith("."))
				return false;

			string albumPath = Path.Combine(_albumBasePath, albumName);

			if (Directory.Exists(albumPath))
				return false;

			Directory.CreateDirectory(albumPath);
			return true;
		}

		public bool DeleteAlbum(string albumName)
		{
			if (string.IsNullOrWhiteSpace(albumName))
				return false;

			string albumPath = Path.Combine(_albumBasePath, albumName);

			if (!Directory.Exists(albumPath))
				return false;

			// .trash로 이동
			string trashDir = Path.Combine(_albumBasePath, ".trash");
			Directory.CreateDirectory(trashDir);
			string trashPath = Path.Combine(trashDir, $"{DateTime.Now:yyyyMMddHHmmss}_{albumName}");

			Directory.Move(albumPath, trashPath);

			// 썸네일 캐시 삭제
			string thumbDir = Path.Combine(_thumbnailCachePath, albumName);

			if (Directory.Exists(thumbDir))
				Directory.Delete(thumbDir, true);

			return true;
		}

		// ============================================
		// 사진 관련
		// ============================================

		public List<AlbumPhoto> GetPhotoList(string albumName)
		{
			return new AlbumDao().GetPhotos(albumName);
		}

		public List<AlbumPhoto> SyncAlbumMetadata(string albumName)
		{
			string albumPath = Path.Combine(_albumBasePath, albumName);

			if (!Directory.Exists(albumPath))
				return new List<AlbumPhoto>();

			var dao = new AlbumDao();
			var files = Directory.GetFiles(albumPath)
				.Where(f => ImageExtensions.Contains(Path.GetExtension(f).ToLower()))
				.OrderBy(f => f)
				.ToList();

			int order = 0;

			foreach (var filePath in files)
			{
				string fileName = Path.GetFileName(filePath);
				var fileInfo = new FileInfo(filePath);

				int width = 0, height = 0;

				try
				{
					using var codec = SKCodec.Create(filePath);

					if (codec != null)
					{
						width = codec.Info.Width;
						height = codec.Info.Height;
					}
				}
				catch { }

				dao.UpsertPhoto(albumName, fileName, width, height, fileInfo.Length, order);
				order++;
			}

			return dao.GetPhotos(albumName);
		}

		public AlbumPhoto UploadPhoto(string albumName, IFormFile file)
		{
			string albumPath = Path.Combine(_albumBasePath, albumName);
			Directory.CreateDirectory(albumPath);

			string extension = Path.GetExtension(file.FileName).ToLower();

			if (!ImageExtensions.Contains(extension))
				throw new InvalidOperationException("지원하지 않는 이미지 형식입니다.");

			string fileName = file.FileName;
			string targetPath = Path.Combine(albumPath, fileName);

			if (File.Exists(targetPath))
			{
				string nameWithout = Path.GetFileNameWithoutExtension(fileName);
				fileName = $"{nameWithout}_{DateTime.Now:yyyyMMddHHmmss}{extension}";
				targetPath = Path.Combine(albumPath, fileName);
			}

			using (var stream = new FileStream(targetPath, FileMode.Create))
			{
				file.CopyTo(stream);
			}

			int width = 0, height = 0;

			try
			{
				using var codec = SKCodec.Create(targetPath);

				if (codec != null)
				{
					width = codec.Info.Width;
					height = codec.Info.Height;
				}
			}
			catch { }

			long fileSize = new FileInfo(targetPath).Length;

			var dao = new AlbumDao();
			dao.UpsertPhoto(albumName, fileName, width, height, fileSize, 0);

			string thumbPath = Path.Combine(_thumbnailCachePath, albumName, fileName);

			if (File.Exists(thumbPath))
				File.Delete(thumbPath);

			return new AlbumPhoto
			{
				ALBUM_NAME = albumName,
				FILE_NAME = fileName,
				WIDTH = width,
				HEIGHT = height,
				FILE_SIZE = fileSize
			};
		}

		public bool DeletePhoto(string albumName, string fileName, int photoId)
		{
			var dao = new AlbumDao();
			dao.DeletePhoto(photoId);

			string sourcePath = Path.Combine(_albumBasePath, albumName, fileName);

			if (File.Exists(sourcePath))
			{
				string trashDir = Path.Combine(_albumBasePath, albumName, ".trash");
				Directory.CreateDirectory(trashDir);
				string trashPath = Path.Combine(trashDir, $"{DateTime.Now:yyyyMMddHHmmss}_{fileName}");

				File.Move(sourcePath, trashPath);
			}

			string thumbPath = Path.Combine(_thumbnailCachePath, albumName, fileName);

			if (File.Exists(thumbPath))
				File.Delete(thumbPath);

			return true;
		}

		public (byte[] data, string contentType)? GetPhoto(string albumName, string fileName)
		{
			string filePath = Path.Combine(_albumBasePath, albumName, fileName);

			if (!ValidatePath(filePath))
				return null;

			byte[] data = File.ReadAllBytes(filePath);
			string contentType = GetContentType(fileName);

			return (data, contentType);
		}

		public (byte[] data, string contentType)? GetThumbnail(string albumName, string fileName)
		{
			string originalPath = Path.Combine(_albumBasePath, albumName, fileName);

			if (!ValidatePath(originalPath))
				return null;

			string thumbDir = Path.Combine(_thumbnailCachePath, albumName);
			string thumbPath = Path.Combine(thumbDir, fileName);

			if (File.Exists(thumbPath))
			{
				byte[] cachedData = File.ReadAllBytes(thumbPath);
				return (cachedData, "image/jpeg");
			}

			try
			{
				Directory.CreateDirectory(thumbDir);

				// EXIF 회전 정보를 적용하여 디코딩
				using var codec = SKCodec.Create(originalPath);
				if (codec == null)
					return null;

				var bitmap = SKBitmap.Decode(codec);
				if (bitmap == null)
					return null;

				// EXIF Orientation에 따라 회전 적용
				var origin = codec.EncodedOrigin;
				if (origin != SKEncodedOrigin.TopLeft && origin != SKEncodedOrigin.Default)
				{
					var rotated = AutoOrient(bitmap, origin);
					bitmap.Dispose();
					bitmap = rotated;
				}

				float ratioX = (float)ThumbnailMaxWidth / bitmap.Width;
				float ratioY = (float)ThumbnailMaxHeight / bitmap.Height;
				float ratio = Math.Min(ratioX, ratioY);

				if (ratio >= 1.0f)
				{
					bitmap.Dispose();
					byte[] data = File.ReadAllBytes(originalPath);
					return (data, GetContentType(fileName));
				}

				int newWidth = (int)(bitmap.Width * ratio);
				int newHeight = (int)(bitmap.Height * ratio);

				using var resized = bitmap.Resize(new SKImageInfo(newWidth, newHeight), new SKSamplingOptions(SKCubicResampler.Mitchell));
				bitmap.Dispose();

				using var image = SKImage.FromBitmap(resized);
				using var encoded = image.Encode(SKEncodedImageFormat.Jpeg, ThumbnailQuality);

				byte[] thumbData = encoded.ToArray();
				File.WriteAllBytes(thumbPath, thumbData);

				return (thumbData, "image/jpeg");
			}
			catch
			{
				byte[] data = File.ReadAllBytes(originalPath);
				return (data, GetContentType(fileName));
			}
		}

		private static SKBitmap AutoOrient(SKBitmap bitmap, SKEncodedOrigin origin)
		{
			switch (origin)
			{
				case SKEncodedOrigin.BottomRight: // 180도
					{
						var rotated = new SKBitmap(bitmap.Width, bitmap.Height);
						using var canvas = new SKCanvas(rotated);
						canvas.RotateDegrees(180, bitmap.Width / 2f, bitmap.Height / 2f);
						canvas.DrawBitmap(bitmap, 0, 0);
						return rotated;
					}
				case SKEncodedOrigin.RightTop: // 90도 시계방향
					{
						var rotated = new SKBitmap(bitmap.Height, bitmap.Width);
						using var canvas = new SKCanvas(rotated);
						canvas.Translate(rotated.Width, 0);
						canvas.RotateDegrees(90);
						canvas.DrawBitmap(bitmap, 0, 0);
						return rotated;
					}
				case SKEncodedOrigin.LeftBottom: // 90도 반시계방향
					{
						var rotated = new SKBitmap(bitmap.Height, bitmap.Width);
						using var canvas = new SKCanvas(rotated);
						canvas.Translate(0, rotated.Height);
						canvas.RotateDegrees(-90);
						canvas.DrawBitmap(bitmap, 0, 0);
						return rotated;
					}
				case SKEncodedOrigin.TopRight: // 좌우 반전
					{
						var flipped = new SKBitmap(bitmap.Width, bitmap.Height);
						using var canvas = new SKCanvas(flipped);
						canvas.Scale(-1, 1, bitmap.Width / 2f, 0);
						canvas.DrawBitmap(bitmap, 0, 0);
						return flipped;
					}
				case SKEncodedOrigin.LeftTop: // 좌우 반전 + 90도 반시계
					{
						var result = new SKBitmap(bitmap.Height, bitmap.Width);
						using var canvas = new SKCanvas(result);
						canvas.Translate(0, result.Height);
						canvas.RotateDegrees(-90);
						canvas.Scale(-1, 1, bitmap.Width / 2f, 0);
						canvas.DrawBitmap(bitmap, 0, 0);
						return result;
					}
				case SKEncodedOrigin.RightBottom: // 좌우 반전 + 90도 시계
					{
						var result = new SKBitmap(bitmap.Height, bitmap.Width);
						using var canvas = new SKCanvas(result);
						canvas.Translate(result.Width, 0);
						canvas.RotateDegrees(90);
						canvas.Scale(-1, 1, bitmap.Width / 2f, 0);
						canvas.DrawBitmap(bitmap, 0, 0);
						return result;
					}
				case SKEncodedOrigin.BottomLeft: // 상하 반전
					{
						var flipped = new SKBitmap(bitmap.Width, bitmap.Height);
						using var canvas = new SKCanvas(flipped);
						canvas.Scale(1, -1, 0, bitmap.Height / 2f);
						canvas.DrawBitmap(bitmap, 0, 0);
						return flipped;
					}
				default:
					return bitmap.Copy();
			}
		}

		// ============================================
		// 관리자 기능
		// ============================================

		public List<AlbumRole> GetAllRoles()
		{
			return new AlbumDao().GetAllRoles();
		}

		public bool AddRole(string roleName)
		{
			return new AlbumDao().AddRole(roleName);
		}

		public bool DeleteRole(int roleId)
		{
			return new AlbumDao().DeleteRole(roleId);
		}

		public List<AlbumUserInfo> GetAllUsers()
		{
			return new AlbumDao().GetAllUsers();
		}

		public List<AlbumUserRoleMapping> GetAllUserRoles()
		{
			return new AlbumDao().GetAllUserRoles();
		}

		public bool AssignUserRole(string phoneNumber, int roleId)
		{
			return new AlbumDao().AssignUserRole(phoneNumber, roleId);
		}

		public bool RemoveUserRole(int userRoleId)
		{
			return new AlbumDao().RemoveUserRole(userRoleId);
		}

		public List<AlbumAccessMapping> GetAllAlbumAccess()
		{
			return new AlbumDao().GetAllAlbumAccess();
		}

		public bool AddAlbumAccess(string albumName, int roleId)
		{
			return new AlbumDao().AddAlbumAccess(albumName, roleId);
		}

		public bool RemoveAlbumAccess(int accessId)
		{
			return new AlbumDao().RemoveAlbumAccess(accessId);
		}

		// ============================================
		// 유틸리티
		// ============================================

		private bool ValidatePath(string filePath)
		{
			if (!File.Exists(filePath))
				return false;

			string fullPath = Path.GetFullPath(filePath);
			string basePath = Path.GetFullPath(_albumBasePath);

			return fullPath.StartsWith(basePath);
		}

		private static string GetContentType(string fileName)
		{
			string extension = Path.GetExtension(fileName).ToLower();
			return extension switch
			{
				".jpg" or ".jpeg" => "image/jpeg",
				".png" => "image/png",
				".gif" => "image/gif",
				".webp" => "image/webp",
				".bmp" => "image/bmp",
				_ => "application/octet-stream"
			};
		}

		private string ComputeSha256Hash(string plainText)
		{
			byte[] bytes = Encoding.UTF8.GetBytes(plainText);
			byte[] hashBytes = SHA256.HashData(bytes);

			StringBuilder sb = new StringBuilder();
			foreach (byte b in hashBytes)
			{
				sb.Append($"{b:x2}");
			}

			return sb.ToString();
		}
	}
}
