import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Seeding Process...');

  // 1. Seed Categories
  const categories = [
    { ten_danh_muc: 'Đồ điện tử', mo_ta: 'Tivi, tủ lạnh, điện thoại, máy tính, phụ kiện điện tử...', trang_thai: 'HOAT_DONG' },
    { ten_danh_muc: 'Đồ gia dụng', mo_ta: 'Bàn ghế, tủ quần áo, nồi chảo, vật dụng gia đình...', trang_thai: 'HOAT_DONG' },
    { ten_danh_muc: 'Thời trang & Phụ kiện', mo_ta: 'Quần áo, giày dép, túi xách, đồng hồ...', trang_thai: 'HOAT_DONG' },
    { ten_danh_muc: 'Sách & Văn phòng phẩm', mo_ta: 'Sách giáo khoa, tiểu thuyết, truyện tranh, dụng cụ học tập...', trang_thai: 'HOAT_DONG' },
    { ten_danh_muc: 'Mẹ & Bé', mo_ta: 'Xe đẩy, đồ chơi, nôi em bé, quần áo trẻ em...', trang_thai: 'HOAT_DONG' },
    { ten_danh_muc: 'Thể thao & Dã ngoại', mo_ta: 'Xe đạp, lều dã ngoại, dụng cụ tập gym, bóng đá...', trang_thai: 'HOAT_DONG' },
    { ten_danh_muc: 'Khác', mo_ta: 'Các vật dụng và tài sản cộng đồng khác...', trang_thai: 'HOAT_DONG' },
  ];

  for (const cat of categories) {
    await prisma.danhMucTaiSan.upsert({
      where: { ten_danh_muc: cat.ten_danh_muc },
      update: {},
      create: cat,
    });
  }
  console.log(`✅ Seeded ${categories.length} Default Categories`);

  // 2. Seed Default Admin User
  const adminEmail = 'admin@assetsharing.com';
  const hashedPassword = await bcrypt.hash('Admin@123456', 10);

  const admin = await prisma.nguoiDung.upsert({
    where: { email: adminEmail },
    update: { mat_khau_hash: hashedPassword },
    create: {
      email: adminEmail,
      so_dien_thoai: '0900000000',
      mat_khau_hash: hashedPassword,
      vai_tro: 'QUAN_TRI_VIEN',
      trang_thai: 'HOAT_DONG',
      ho_so: {
        create: {
          ho_ten: 'Quản Trị Viên Hệ Thống',
          dia_chi: 'Thành phố Hồ Chí Minh',
          mo_ta_ca_nhan: 'Tài khoản quản trị viên chính thức của nền tảng Asset Sharing.',
        },
      },
      ho_so_uy_tin: {
        create: {
          diem_trung_binh: 5.0,
          tong_so_danh_gia: 0,
          so_giao_dich_hoan_tat: 0,
        },
      },
    },
  });

  console.log(`✅ Updated Admin Password Hash for: ${admin.email}`);
  console.log('🎉 Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
