# Günlük Otomatik Yedekleme için Cron Job Ayarları

Sisteminizde günlük otomatik yedekleme yapmak için aşağıdaki adımları izleyin:

## 1. Vercel Cron Jobs (Önerilen)

Eğer uygulamanız Vercel'de host ediliyorsa, Vercel Cron Jobs kullanabilirsiniz:

1. `vercel.json` dosyasını projenizin kök dizinine ekleyin:

\`\`\`json
{
 "crons": [
   {
     "path": "/api/scheduled-backup?key=YOUR_BACKUP_API_SECRET",
     "schedule": "0 3 * * *"
   }
 ]
}
\`\`\`

Bu ayar, her gün saat 03:00'te otomatik yedekleme işlemini çalıştıracaktır.

## 2. Harici Cron Servisi

Eğer Vercel kullanmıyorsanız veya ek bir güvenlik katmanı istiyorsanız, aşağıdaki harici cron servislerini kullanabilirsiniz:

- [Cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)
- [SetCronJob](https://www.setcronjob.com)

Bu servislerde aşağıdaki URL'yi ayarlayın:
\`\`\`
https://sizin-siteniz.com/api/scheduled-backup?key=YOUR_BACKUP_API_SECRET
\`\`\`

Zamanlamayı her gün saat 03:00 olarak ayarlayın.

## 3. Kendi Sunucunuzda Cron

Eğer kendi sunucunuzu yönetiyorsanız, standart Linux cron kullanabilirsiniz:

\`\`\`bash
# Crontab'ı düzenle
crontab -e

# Aşağıdaki satırı ekle
0 3 * * * curl -s "https://sizin-siteniz.com/api/scheduled-backup?key=YOUR_BACKUP_API_SECRET" > /dev/null 2>&1
\`\`\`

## Güvenlik Notu

- `YOUR_BACKUP_API_SECRET` değerini güçlü ve benzersiz bir değerle değiştirin
- Bu değeri `.env` dosyanızda `BACKUP_API_SECRET` olarak saklayın
- API anahtarını düzenli olarak değiştirin
- Yedekleme URL'sini gizli tutun

## Yedekleme Zamanı Seçimi

Yedekleme işlemini, sitenizin en az kullanıldığı saatlerde çalıştırmak en iyisidir. Genellikle gece yarısı veya sabahın erken saatleri (03:00 gibi) tercih edilir.
