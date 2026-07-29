import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixReports() {
  console.log('🔄 Đang kiểm tra và cập nhật các bản ghi bao_cao_vi_pham bị thiếu nguoi_dung_bi_bao_cao_id trong CSDL...');

  const nullUserReports = await prisma.baoCaoViPham.findMany({
    where: {
      nguoi_dung_bi_bao_cao_id: null,
      bai_dang_bi_bao_cao_id: { not: null },
    },
    select: {
      bao_cao_id: true,
      bai_dang_bi_bao_cao_id: true,
    },
  });

  console.log(`🔍 Tìm thấy ${nullUserReports.length} bản ghi báo cáo cần cập nhật.`);

  let updatedCount = 0;
  for (const report of nullUserReports) {
    if (report.bai_dang_bi_bao_cao_id) {
      const asset = await prisma.baiDangTaiSan.findUnique({
        where: { bai_dang_id: report.bai_dang_bi_bao_cao_id },
        select: { chu_so_huu_id: true },
      });

      if (asset && asset.chu_so_huu_id) {
        await prisma.baoCaoViPham.update({
          where: { bao_cao_id: report.bao_cao_id },
          data: { nguoi_dung_bi_bao_cao_id: asset.chu_so_huu_id },
        });
        updatedCount++;
      }
    }
  }

  console.log(`✅ Hoàn tất! Đã cập nhật thành công ${updatedCount}/${nullUserReports.length} bản ghi trong CSDL.`);
}

fixReports()
  .catch((e) => {
    console.error('❌ Lỗi khi cập nhật:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
