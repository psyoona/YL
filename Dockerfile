# 1. 베이스 이미지 설정 (ASP.NET Core 런타임)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
# ★ 로그 디렉터리 미리 생성 (마운트될 예정이지만, 없더라도 문제 없게)
RUN mkdir -p /app/logs

# 2. 빌드 및 복사 단계
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore
RUN dotnet publish -c Release -o /out

# 3. 실행 단계
FROM base AS final
WORKDIR /app
COPY --from=build /out .
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "YL.dll"]