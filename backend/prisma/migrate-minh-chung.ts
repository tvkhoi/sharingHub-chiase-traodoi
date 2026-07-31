import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Đang bắt đầu backfill dữ liệu minh_chung cũ sang bảng minh_chung_bao_cao...');

  const reportsWithEvidence = await prisma.baoCaoViPham.findMany({
    where: {
      minh_chung: {
        not: null,
      },
    },
    select: {
      bao_cao_id: true,
      minh_chung: true,
      danh_sach_minh_chung: {
        select: { minh_chung_id: true },
      },
    },
  });

  console.log(`Tìm thấy ${reportsWithEvidence.length} báo cáo có minh_chung cũ.`);

  let createdCount = 0;
  for (const report of reportsWithEvidence) {
    if (report.minh_chung && report.danh_sach_minh_chung.length === 0) {
      // split by comma if multiple URLs were stored as string, or store single URL
      const urls = report.minh_chung.split(',').map((u) => u.trim()).filter(Boolean);

      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        const fileName = url.substring(url.lastIndexOf('/') + 1) || 'Bằng chứng đính kèm';
        const fileExt = fileName.includes('.') ? fileName.substring(fileName.lastIndexOf('.') + 1) : '';

        await prisma.minhChungBaoCao.create({
          data: {
            bao_cao_id: report.bao_cao_id,
            duong_dan_tep: url,
            ten_tep: fileName,
            loai_tep: fileExt ? `image/${fileExt}` : 'image/jpeg',
            thu_tu_hien_thi: i + 1,
          },
        });
        createdCount++;
      }
    }
  }

  console.log(`✅ Đã backfill thành công ${createdCount} bản ghi minh chứng vào bảng minh_chung_bao_cao!`);
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi backfill dữ liệu minh chứng:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
