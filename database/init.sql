-- ========================================================
-- INITIALIZATION SQL SCRIPT FOR ASSET SHARING DATABASE
-- Automatically executed by Docker entrypoint on container start
-- ========================================================

SET client_encoding = 'UTF8';
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --------------------------------------------------------
-- ENUM TYPES
-- --------------------------------------------------------

DO $$ BEGIN
    CREATE TYPE "VaiTro" AS ENUM ('THANH_VIEN', 'QUAN_TRI_VIEN');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "TrangThaiNguoiDung" AS ENUM ('CHO_XAC_THUC', 'HOAT_DONG', 'DA_KHOA');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "HinhThucChiaSe" AS ENUM ('CHO_TANG', 'TRAO_DOI');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "HinhThucTraoDoi" AS ENUM ('DO_VAT', 'TIEN');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "TrangThaiBaiDang" AS ENUM ('KHA_DUNG', 'TAM_HET_KHA_DUNG', 'DA_KET_THUC');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "TrangThaiDeXuat" AS ENUM ('CHO_XU_LY', 'DANG_THUONG_LUONG', 'DA_CHAP_NHAN', 'TU_CHOI', 'DA_HUY', 'HET_HIEU_LUC');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "TrangThaiGiaoDich" AS ENUM ('CHO_BAN_GIAO', 'CHO_BEN_CON_LAI_XAC_NHAN', 'HOAN_TAT', 'DA_HUY');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "LoaiDoiTuongBaoCao" AS ENUM ('BAI_DANG', 'NGUOI_DUNG');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "TrangThaiBaoCao" AS ENUM ('CHO_XU_LY', 'DA_XU_LY', 'TU_CHOI');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "LoaiBienPhap" AS ENUM ('CANH_BAO', 'AN_BAI_DANG', 'KHOA_TAI_KHOAN', 'KHONG_VI_PHAM');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- --------------------------------------------------------
-- TABLES CREATION
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS "nguoi_dung" (
    "ma_nguoi_dung" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "so_dien_thoai" VARCHAR(20) UNIQUE,
    "mat_khau_hash" VARCHAR(255) NOT NULL,
    "vai_tro" "VaiTro" NOT NULL DEFAULT 'THANH_VIEN',
    "trang_thai" "TrangThaiNguoiDung" NOT NULL DEFAULT 'HOAT_DONG',
    "ngay_tao" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngay_cap_nhat" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "ho_so_thanh_vien" (
    "ma_ho_so" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "ma_nguoi_dung" UUID UNIQUE NOT NULL REFERENCES "nguoi_dung"("ma_nguoi_dung") ON DELETE CASCADE,
    "ho_ten" VARCHAR(255) NOT NULL,
    "anh_dai_dien" TEXT,
    "dia_chi" VARCHAR(255),
    "khu_vuc" VARCHAR(100),
    "mo_ta" TEXT,
    "ngay_tao" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngay_cap_nhat" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "ho_so_uy_tin" (
    "ma_uy_tin" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "ma_nguoi_dung" UUID UNIQUE NOT NULL REFERENCES "nguoi_dung"("ma_nguoi_dung") ON DELETE CASCADE,
    "diem_uy_tin" INT NOT NULL DEFAULT 100,
    "diem_trung_binh" DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
    "tong_luot_danh_gia" INT NOT NULL DEFAULT 0,
    "ngay_cap_nhat" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "danh_muc_tai_san" (
    "ma_danh_muc" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "ten_danh_muc" VARCHAR(100) UNIQUE NOT NULL,
    "mo_ta" TEXT,
    "ngay_tao" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "bai_dang_tai_san" (
    "ma_bai_dang" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "ma_nguoi_dung" UUID NOT NULL REFERENCES "nguoi_dung"("ma_nguoi_dung") ON DELETE CASCADE,
    "ma_danh_muc" UUID NOT NULL REFERENCES "danh_muc_tai_san"("ma_danh_muc"),
    "ten_tai_san" VARCHAR(255) NOT NULL,
    "mo_ta" TEXT NOT NULL,
    "tinh_trang" VARCHAR(100) NOT NULL,
    "so_luong_tong" INT NOT NULL,
    "so_luong_kha_dung" INT NOT NULL,
    "so_luong_giu_cho" INT NOT NULL DEFAULT 0,
    "so_luong_da_phan_phoi" INT NOT NULL DEFAULT 0,
    "hinh_thuc_chia_se" "HinhThucChiaSe" NOT NULL,
    "hinh_thuc_trao_doi" "HinhThucTraoDoi",
    "yeu_cau_trao_doi" TEXT,
    "dia_chi_giao_nhan" VARCHAR(255) NOT NULL,
    "trang_thai" "TrangThaiBaiDang" NOT NULL DEFAULT 'KHA_DUNG',
    "ngay_tao" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngay_cap_nhat" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "hinh_anh_tai_san" (
    "ma_hinh_anh" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "ma_bai_dang" UUID NOT NULL REFERENCES "bai_dang_tai_san"("ma_bai_dang") ON DELETE CASCADE,
    "duong_dan_anh" TEXT NOT NULL,
    "thu_tu" INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "de_xuat_giao_dich" (
    "ma_de_xuat" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "ma_bai_dang" UUID NOT NULL REFERENCES "bai_dang_tai_san"("ma_bai_dang") ON DELETE CASCADE,
    "ma_nguoi_gui" UUID NOT NULL REFERENCES "nguoi_dung"("ma_nguoi_dung") ON DELETE CASCADE,
    "so_luong_yeu_cau" INT NOT NULL,
    "loi_nhan" TEXT,
    "trang_thai" "TrangThaiDeXuat" NOT NULL DEFAULT 'CHO_XU_LY',
    "ngay_tao" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngay_cap_nhat" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "tin_nhan_thuong_luong" (
    "ma_tin_nhan" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "ma_de_xuat" UUID NOT NULL REFERENCES "de_xuat_giao_dich"("ma_de_xuat") ON DELETE CASCADE,
    "ma_nguoi_gui" UUID NOT NULL REFERENCES "nguoi_dung"("ma_nguoi_dung") ON DELETE CASCADE,
    "noi_dung" TEXT NOT NULL,
    "ngay_tao" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "giao_dich" (
    "ma_giao_dich" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "ma_de_xuat" UUID UNIQUE NOT NULL REFERENCES "de_xuat_giao_dich"("ma_de_xuat") ON DELETE CASCADE,
    "ma_nguoi_so_huu" UUID NOT NULL REFERENCES "nguoi_dung"("ma_nguoi_dung"),
    "ma_nguoi_tiep_nhan" UUID NOT NULL REFERENCES "nguoi_dung"("ma_nguoi_dung"),
    "ma_bai_dang" UUID NOT NULL REFERENCES "bai_dang_tai_san"("ma_bai_dang"),
    "so_luong" INT NOT NULL,
    "trang_thai" "TrangThaiGiaoDich" NOT NULL DEFAULT 'CHO_BAN_GIAO',
    "xac_nhan_nguoi_so_huu" BOOLEAN NOT NULL DEFAULT FALSE,
    "xac_nhan_nguoi_tiep_nhan" BOOLEAN NOT NULL DEFAULT FALSE,
    "ly_do_huy" TEXT,
    "ngay_tao" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngay_cap_nhat" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "danh_gia" (
    "ma_danh_gia" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "ma_giao_dich" UUID NOT NULL REFERENCES "giao_dich"("ma_giao_dich") ON DELETE CASCADE,
    "ma_nguoi_danh_gia" UUID NOT NULL REFERENCES "nguoi_dung"("ma_nguoi_dung"),
    "ma_nguoi_nhan_danh_gia" UUID NOT NULL REFERENCES "nguoi_dung"("ma_nguoi_dung"),
    "so_sao" INT NOT NULL,
    "noi_dung" TEXT,
    "ngay_tao" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "bao_cao_vi_pham" (
    "ma_bao_cao" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "ma_nguoi_bao_cao" UUID NOT NULL REFERENCES "nguoi_dung"("ma_nguoi_dung") ON DELETE CASCADE,
    "loai_doi_tuong" "LoaiDoiTuongBaoCao" NOT NULL,
    "ma_doi_tuong" UUID NOT NULL,
    "ly_do" TEXT NOT NULL,
    "minh_chung" TEXT,
    "trang_thai" "TrangThaiBaoCao" NOT NULL DEFAULT 'CHO_XU_LY',
    "ngay_tao" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngay_cap_nhat" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "bien_phap_xu_ly" (
    "ma_bien_phap" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "ma_bao_cao" UUID NOT NULL REFERENCES "bao_cao_vi_pham"("ma_bao_cao") ON DELETE CASCADE,
    "ma_quan_tri_vien" UUID NOT NULL REFERENCES "nguoi_dung"("ma_nguoi_dung"),
    "loai_bien_phap" "LoaiBienPhap" NOT NULL,
    "ghi_chu" TEXT,
    "ngay_thuc_hien" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- DATABASE VIEWS
-- --------------------------------------------------------

CREATE OR REPLACE VIEW vw_bai_dang_kha_dung AS
SELECT 
    b.ma_bai_dang,
    b.ten_tai_san,
    b.mo_ta,
    b.tinh_trang,
    b.so_luong_kha_dung,
    b.hinh_thuc_chia_se,
    b.hinh_thuc_trao_doi,
    b.yeu_cau_trao_doi,
    b.dia_chi_giao_nhan,
    b.ngay_tao,
    d.ten_danh_muc,
    h.ho_ten AS ten_nguoi_dang,
    u.diem_uy_tin,
    u.diem_trung_binh
FROM bai_dang_tai_san b
JOIN danh_muc_tai_san d ON b.ma_danh_muc = d.ma_danh_muc
JOIN nguoi_dung n ON b.ma_nguoi_dung = n.ma_nguoi_dung
JOIN ho_so_thanh_vien h ON n.ma_nguoi_dung = h.ma_nguoi_dung
JOIN ho_so_uy_tin u ON n.ma_nguoi_dung = u.ma_nguoi_dung
WHERE b.trang_thai = 'KHA_DUNG' AND n.trang_thai = 'HOAT_DONG';

CREATE OR REPLACE VIEW vw_ho_so_uy_tin AS
SELECT 
    n.ma_nguoi_dung,
    h.ho_ten,
    h.anh_dai_dien,
    h.khu_vuc,
    u.diem_uy_tin,
    u.diem_trung_binh,
    u.tong_luot_danh_gia,
    n.trang_thai
FROM nguoi_dung n
JOIN ho_so_thanh_vien h ON n.ma_nguoi_dung = h.ma_nguoi_dung
JOIN ho_so_uy_tin u ON n.ma_nguoi_dung = u.ma_nguoi_dung;

CREATE OR REPLACE VIEW vw_bao_cao_can_xu_ly AS
SELECT 
    bc.ma_bao_cao,
    bc.loai_doi_tuong,
    bc.ma_doi_tuong,
    bc.ly_do,
    bc.minh_chung,
    bc.ngay_tao,
    h.ho_ten AS ten_nguoi_bao_cao
FROM bao_cao_vi_pham bc
JOIN nguoi_dung n ON bc.ma_nguoi_bao_cao = n.ma_nguoi_dung
JOIN ho_so_thanh_vien h ON n.ma_nguoi_dung = h.ma_nguoi_dung
WHERE bc.trang_thai = 'CHO_XU_LY';

CREATE OR REPLACE VIEW vw_giao_dich_dang_thuc_hien AS
SELECT 
    g.ma_giao_dich,
    b.ten_tai_san,
    g.so_luong,
    g.trang_thai,
    hs_sh.ho_ten AS ten_nguoi_so_huu,
    hs_tn.ho_ten AS ten_nguoi_tiep_nhan,
    g.ngay_tao
FROM giao_dich g
JOIN bai_dang_tai_san b ON g.ma_bai_dang = b.ma_bai_dang
JOIN ho_so_thanh_vien hs_sh ON g.ma_nguoi_so_huu = hs_sh.ma_nguoi_dung
JOIN ho_so_thanh_vien hs_tn ON g.ma_nguoi_tiep_nhan = hs_tn.ma_nguoi_dung
WHERE g.trang_thai IN ('CHO_BAN_GIAO', 'CHO_BEN_CON_LAI_XAC_NHAN');

-- --------------------------------------------------------
-- DATABASE INDEXES
-- --------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_nguoi_dung_email ON nguoi_dung(email);
CREATE INDEX IF NOT EXISTS idx_nguoi_dung_sdt ON nguoi_dung(so_dien_thoai);
CREATE INDEX IF NOT EXISTS idx_bai_dang_nguoi_dung ON bai_dang_tai_san(ma_nguoi_dung);
CREATE INDEX IF NOT EXISTS idx_bai_dang_danh_muc ON bai_dang_tai_san(ma_danh_muc);
CREATE INDEX IF NOT EXISTS idx_bai_dang_trang_thai ON bai_dang_tai_san(trang_thai);
CREATE INDEX IF NOT EXISTS idx_de_xuat_bai_dang ON de_xuat_giao_dich(ma_bai_dang);
CREATE INDEX IF NOT EXISTS idx_de_xuat_nguoi_gui ON de_xuat_giao_dich(ma_nguoi_gui);
CREATE INDEX IF NOT EXISTS idx_de_xuat_trang_thai ON de_xuat_giao_dich(trang_thai);
CREATE INDEX IF NOT EXISTS idx_tin_nhan_de_xuat ON tin_nhan_thuong_luong(ma_de_xuat);
CREATE INDEX IF NOT EXISTS idx_giao_dich_so_huu ON giao_dich(ma_nguoi_so_huu);
CREATE INDEX IF NOT EXISTS idx_giao_dich_tiep_nhan ON giao_dich(ma_nguoi_tiep_nhan);
CREATE INDEX IF NOT EXISTS idx_giao_dich_trang_thai ON giao_dich(trang_thai);
CREATE INDEX IF NOT EXISTS idx_danh_gia_nguoi_nhan ON danh_gia(ma_nguoi_nhan_danh_gia);

-- --------------------------------------------------------
-- INITIAL DATA SEEDING
-- --------------------------------------------------------

INSERT INTO "danh_muc_tai_san" ("ten_danh_muc", "mo_ta")
VALUES 
    ('Đồ điện tử', 'Tivi, tủ lạnh, điện thoại, máy tính, phụ kiện điện tử...'),
    ('Đồ gia dụng', 'Bàn ghế, tủ quần áo, nồi chảo, vật dụng gia đình...'),
    ('Thời trang & Phụ kiện', 'Quần áo, giày dép, túi xách, đồng hồ...'),
    ('Sách & Văn phòng phẩm', 'Sách giáo khoa, tiểu thuyết, truyện tranh, dụng cụ học tập...'),
    ('Mẹ & Bé', 'Xe đẩy, đồ chơi, nôi em bé, quần áo trẻ em...'),
    ('Thể thao & Dã ngoại', 'Xe đạp, lều dã ngoại, dụng cụ tập gym, bóng đá...'),
    ('Khác', 'Các vật dụng và tài sản cộng đồng khác...')
ON CONFLICT ("ten_danh_muc") DO NOTHING;

-- Seed Admin User (admin@assetsharing.com / Admin@123456)
DO $$
DECLARE
    admin_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM nguoi_dung WHERE email = 'admin@assetsharing.com') THEN
        INSERT INTO nguoi_dung (email, so_dien_thoai, mat_khau_hash, vai_tro, trang_thai)
        VALUES ('admin@assetsharing.com', '0900000000', '$2b$10$w09l/KSmLbh9P3J89vN.X.rY1/j7wUj4yGjR5G6H7I8J9K0L1M2N3', 'QUAN_TRI_VIEN', 'HOAT_DONG')
        RETURNING ma_nguoi_dung INTO admin_id;

        INSERT INTO ho_so_thanh_vien (ma_nguoi_dung, ho_ten, khu_vuc)
        VALUES (admin_id, 'Quản Trị Viên Hệ Thống', 'Thành phố Hồ Chí Minh');

        INSERT INTO ho_so_uy_tin (ma_nguoi_dung, diem_uy_tin, diem_trung_binh, tong_luot_danh_gia)
        VALUES (admin_id, 100, 5.00, 0);
    END IF;
END $$;