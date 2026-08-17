# RASHA Smart Warehouse — Scaffold

این یک اسکلت اولیه است که شامل سرویس API و بانک اطلاعاتی PostgreSQL و اسکلت موبایل Flutter و پنل Admin می‌باشد و برای اجرا داخل LAN طراحی شده است.

روش سریع شروع (لوکال با Docker):
1. تغییر متغیرهای محیطی در docker-compose.yml یا در یک فایل .env
2. اجرا:
   docker compose up --build

سرویس‌ها:
- API: http://localhost:8080/api
- Health: http://localhost:8080/api/health
- PostgreSQL: localhost:5432 (user: rasha / password: rasha_pass)

گام‌های بعدی که من انجام می‌دهم:
- افزودن GitHub Actions برای تولید debug APK و انتشار artifact
- پیاده‌سازی endpointهای import/export و seed admin user
- افزودن WebSocket chat و frontend های کامل

Admin sample credentials (seed will create user via script):
- personnel_code: 302237
- password: 1985

