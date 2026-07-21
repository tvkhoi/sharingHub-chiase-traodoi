-- ========================================================
-- INITIALIZATION SQL SCRIPT FOR ASSET SHARING DATABASE
-- 100% Exact Alignment with Database Specification Document (DSD)
-- ========================================================

SET client_encoding = 'UTF8';
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --------------------------------------------------------
-- TABLES CREATION WITH FULL CHECK CONSTRAINTS
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS nguoi_dung (
    nguoi_dung_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(254) UNIQUE,
    so_dien_thoai VARCHAR(20) UNIQUE,
    mat_khau_hash VARCHAR(255) NOT NULL,
    vai_tro VARCHAR(30) NOT NULL DEFAULT 'THANH_VIEN',
    trang_thai VARCHAR(30) NOT NULL DEFAULT 'CHO_XAC_THUC',
    ngay_tao TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_nguoi_dung_dang_nhap CHECK (email IS NOT NULL OR so_dien_thoai IS NOT NULL),
    CONSTRAINT ck_nguoi_dung_vai_tro CHECK (vai_tro IN ('THANH_VIEN', 'QUAN_TRI_VIEN')),
    CONSTRAINT ck_nguoi_dung_trang_thai CHECK (trang_thai IN ('CHO_XAC_THUC', 'HOAT_DONG', 'BI_KHOA', 'NGUNG_HOAT_DONG'))
);

CREATE TABLE IF NOT EXISTS ho_so_thanh_vien (
    ho_so_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nguoi_dung_id UUID NOT NULL UNIQUE REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE RESTRICT,
    ho_ten VARCHAR(150) NOT NULL,
    anh_dai_dien VARCHAR(500),
    dia_chi VARCHAR(255),
    mo_ta_ca_nhan TEXT,
    ngay_cap_nhat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ho_so_uy_tin (
    ho_so_uy_tin_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nguoi_dung_id UUID NOT NULL UNIQUE REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE CASCADE,
    diem_trung_binh NUMERIC(3,2) DEFAULT 0.00,
    tong_so_danh_gia INTEGER DEFAULT 0,
    so_giao_dich_hoan_tat INTEGER DEFAULT 0,
    ngay_cap_nhat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_diem_uy_tin CHECK (diem_trung_binh BETWEEN 0 AND 5),
    CONSTRAINT ck_so_lieu_uy_tin CHECK (tong_so_danh_gia >= 0 AND so_giao_dich_hoan_tat >= 0)
);

CREATE TABLE IF NOT EXISTS danh_muc_tai_san (
    danh_muc_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ten_danh_muc VARCHAR(100) NOT NULL UNIQUE,
    mo_ta TEXT,
    trang_thai VARCHAR(30) DEFAULT 'HOAT_DONG',
    ngay_tao TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_trang_thai_danh_muc CHECK (trang_thai IN ('HOAT_DONG', 'NGUNG_SU_DUNG'))
);

CREATE TABLE IF NOT EXISTS bai_dang_tai_san (
    bai_dang_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chu_so_huu_id UUID NOT NULL REFERENCES nguoi_dung(nguoi_dung_id),
    danh_muc_id UUID NOT NULL REFERENCES danh_muc_tai_san(danh_muc_id),
    ten_tai_san VARCHAR(200) NOT NULL,
    mo_ta_hien_trang TEXT NOT NULL,
    so_luong_tong INTEGER NOT NULL,
    so_luong_kha_dung INTEGER NOT NULL,
    so_luong_giu_cho INTEGER DEFAULT 0,
    so_luong_da_phan_phoi INTEGER DEFAULT 0,
    dia_diem VARCHAR(255) NOT NULL,
    hinh_thuc_chia_se VARCHAR(30) NOT NULL,
    hinh_thuc_trao_doi VARCHAR(30),
    trang_thai VARCHAR(30) DEFAULT 'KHA_DUNG',
    ngay_tao TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_so_luong CHECK (
        so_luong_tong >= 1 
        AND so_luong_kha_dung >= 0 
        AND so_luong_giu_cho >= 0 
        AND so_luong_da_phan_phoi >= 0 
        AND (so_luong_kha_dung + so_luong_giu_cho + so_luong_da_phan_phoi = so_luong_tong)
    ),
    CONSTRAINT ck_hinh_thuc_chia_se CHECK (hinh_thuc_chia_se IN ('CHO_TANG', 'TRAO_DOI')),
    CONSTRAINT ck_hinh_thuc_trao_doi CHECK (
        (hinh_thuc_chia_se = 'CHO_TANG' AND hinh_thuc_trao_doi IS NULL) 
        OR (hinh_thuc_chia_se = 'TRAO_DOI' AND hinh_thuc_trao_doi IN ('TAI_SAN', 'TIEN'))
    ),
    CONSTRAINT ck_trang_thai_bai_dang CHECK (trang_thai IN ('KHA_DUNG', 'TAM_HET_KHA_DUNG', 'DA_KET_THUC'))
);

CREATE TABLE IF NOT EXISTS hinh_anh_tai_san (
    hinh_anh_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bai_dang_id UUID NOT NULL REFERENCES bai_dang_tai_san(bai_dang_id) ON DELETE CASCADE,
    duong_dan_anh VARCHAR(500) NOT NULL,
    thu_tu_hien_thi INTEGER NOT NULL DEFAULT 1,
    ngay_tai_len TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_hinh_anh_thu_tu UNIQUE (bai_dang_id, thu_tu_hien_thi),
    CONSTRAINT ck_hinh_anh_duong_dan CHECK (CHAR_LENGTH(TRIM(duong_dan_anh)) > 0),
    CONSTRAINT ck_hinh_anh_thu_tu CHECK (thu_tu_hien_thi >= 1)
);

CREATE TABLE IF NOT EXISTS de_xuat_giao_dich (
    de_xuat_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bai_dang_id UUID NOT NULL REFERENCES bai_dang_tai_san(bai_dang_id),
    nguoi_gui_id UUID NOT NULL REFERENCES nguoi_dung(nguoi_dung_id),
    so_luong_yeu_cau INTEGER NOT NULL,
    loi_nhan TEXT,
    tai_san_doi_ung TEXT,
    tien_doi_ung NUMERIC(18,2),
    trang_thai VARCHAR(30) NOT NULL DEFAULT 'CHO_XU_LY',
    ly_do_tu_choi TEXT,
    ngay_gui TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_de_xuat_so_luong CHECK (so_luong_yeu_cau > 0),
    CONSTRAINT ck_de_xuat_tien_doi_ung CHECK (tien_doi_ung IS NULL OR tien_doi_ung >= 0),
    CONSTRAINT ck_de_xuat_trang_thai CHECK (trang_thai IN ('CHO_XU_LY', 'DANG_THUONG_LUONG', 'DA_CHAP_NHAN', 'TU_CHOI', 'DA_HUY', 'HET_HIEU_LUC'))
);

CREATE TABLE IF NOT EXISTS tin_nhan_thuong_luong (
    tin_nhan_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    de_xuat_id UUID NOT NULL REFERENCES de_xuat_giao_dich(de_xuat_id),
    nguoi_gui_id UUID NOT NULL REFERENCES nguoi_dung(nguoi_dung_id),
    noi_dung TEXT NOT NULL,
    trang_thai VARCHAR(30) NOT NULL DEFAULT 'DA_GUI',
    thoi_gian_gui TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_tin_nhan_noi_dung CHECK (CHAR_LENGTH(TRIM(noi_dung)) > 0),
    CONSTRAINT ck_tin_nhan_trang_thai CHECK (trang_thai IN ('DA_GUI', 'DA_DOC', 'BI_AN'))
);

CREATE TABLE IF NOT EXISTS giao_dich (
    giao_dich_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    de_xuat_id UUID UNIQUE NOT NULL REFERENCES de_xuat_giao_dich(de_xuat_id),
    nguoi_so_huu_id UUID NOT NULL REFERENCES nguoi_dung(nguoi_dung_id),
    nguoi_tiep_nhan_id UUID NOT NULL REFERENCES nguoi_dung(nguoi_dung_id),
    so_luong_giao_dich INTEGER NOT NULL,
    thoi_gian_ban_giao TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dia_diem_ban_giao VARCHAR(255) NOT NULL,
    xac_nhan_nguoi_so_huu BOOLEAN NOT NULL DEFAULT FALSE,
    xac_nhan_nguoi_tiep_nhan BOOLEAN NOT NULL DEFAULT FALSE,
    ly_do_huy TEXT,
    trang_thai VARCHAR(40) NOT NULL DEFAULT 'CHO_BAN_GIAO',
    ngay_tao TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_giao_dich_so_luong CHECK (so_luong_giao_dich > 0),
    CONSTRAINT ck_giao_dich_hai_ben CHECK (nguoi_so_huu_id <> nguoi_tiep_nhan_id),
    CONSTRAINT ck_giao_dich_trang_thai CHECK (trang_thai IN ('CHO_BAN_GIAO', 'CHO_BEN_CON_LAI_XAC_NHAN', 'HOAN_TAT', 'DA_HUY'))
);

CREATE TABLE IF NOT EXISTS danh_gia (
    danh_gia_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    giao_dich_id UUID NOT NULL REFERENCES giao_dich(giao_dich_id),
    nguoi_danh_gia_id UUID NOT NULL REFERENCES nguoi_dung(nguoi_dung_id),
    nguoi_duoc_danh_gia_id UUID NOT NULL REFERENCES nguoi_dung(nguoi_dung_id),
    diem_sao SMALLINT NOT NULL,
    nhan_xet TEXT,
    thoi_gian_danh_gia TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_danh_gia_giao_dich_nguoi_danh_gia UNIQUE (giao_dich_id, nguoi_danh_gia_id),
    CONSTRAINT ck_danh_gia_diem_sao CHECK (diem_sao BETWEEN 1 AND 5),
    CONSTRAINT ck_danh_gia_hai_ben CHECK (nguoi_danh_gia_id <> nguoi_duoc_danh_gia_id)
);

CREATE TABLE IF NOT EXISTS bao_cao_vi_pham (
    bao_cao_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nguoi_bao_cao_id UUID NOT NULL REFERENCES nguoi_dung(nguoi_dung_id),
    nguoi_dung_bi_bao_cao_id UUID REFERENCES nguoi_dung(nguoi_dung_id),
    bai_dang_bi_bao_cao_id UUID REFERENCES bai_dang_tai_san(bai_dang_id),
    loai_bao_cao VARCHAR(30) NOT NULL,
    ly_do_vi_pham VARCHAR(50) NOT NULL,
    mo_ta_chi_tiet TEXT NOT NULL,
    minh_chung VARCHAR(500),
    trang_thai_xu_ly VARCHAR(40) NOT NULL DEFAULT 'CHO_KIEM_DUYET',
    ngay_bao_cao TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_bao_cao_loai CHECK (loai_bao_cao IN ('NGUOI_DUNG', 'BAI_DANG')),
    CONSTRAINT ck_bao_cao_doi_tuong CHECK (
        (loai_bao_cao = 'NGUOI_DUNG' AND nguoi_dung_bi_bao_cao_id IS NOT NULL AND bai_dang_bi_bao_cao_id IS NULL)
        OR (loai_bao_cao = 'BAI_DANG' AND nguoi_dung_bi_bao_cao_id IS NULL AND bai_dang_bi_bao_cao_id IS NOT NULL)
    ),
    CONSTRAINT ck_bao_cao_trang_thai CHECK (trang_thai_xu_ly IN ('CHO_KIEM_DUYET', 'DANG_XU_LY', 'CHO_BO_SUNG_MINH_CHUNG', 'DA_XU_LY', 'TU_CHOI', 'KHONG_DU_CAN_CU'))
);

CREATE TABLE IF NOT EXISTS bien_phap_xu_ly (
    bien_phap_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bao_cao_id UUID NOT NULL REFERENCES bao_cao_vi_pham(bao_cao_id),
    quan_tri_vien_id UUID NOT NULL REFERENCES nguoi_dung(nguoi_dung_id),
    loai_bien_phap VARCHAR(40) NOT NULL,
    noi_dung_xu_ly TEXT NOT NULL,
    thoi_gian_xu_ly TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_bien_phap_loai CHECK (loai_bien_phap IN ('CANH_BAO', 'AN_BAI_DANG', 'XOA_BAI_DANG', 'KHOA_TAI_KHOAN', 'KHONG_AP_DUNG_CHE_TAI'))
);

-- --------------------------------------------------------
-- DATABASE VIEWS (DSD Section VII)
-- --------------------------------------------------------

CREATE OR REPLACE VIEW vw_bai_dang_kha_dung AS
SELECT 
    bd.bai_dang_id,
    bd.ten_tai_san,
    bd.mo_ta_hien_trang,
    bd.so_luong_tong,
    bd.so_luong_kha_dung,
    bd.dia_diem,
    bd.hinh_thuc_chia_se,
    bd.hinh_thuc_trao_doi,
    bd.danh_muc_id,
    dm.ten_danh_muc,
    bd.chu_so_huu_id,
    bd.ngay_tao
FROM bai_dang_tai_san bd
JOIN danh_muc_tai_san dm ON dm.danh_muc_id = bd.danh_muc_id
WHERE bd.trang_thai = 'KHA_DUNG' AND bd.so_luong_kha_dung > 0;

CREATE OR REPLACE VIEW vw_ho_so_uy_tin AS
SELECT 
    nd.nguoi_dung_id,
    hs.ho_ten,
    hs.anh_dai_dien,
    hs.dia_chi,
    hs.mo_ta_ca_nhan,
    uy.diem_trung_binh,
    uy.tong_so_danh_gia,
    uy.so_giao_dich_hoan_tat,
    nd.trang_thai AS trang_thai_tai_khoan
FROM nguoi_dung nd
JOIN ho_so_thanh_vien hs ON hs.nguoi_dung_id = nd.nguoi_dung_id
JOIN ho_so_uy_tin uy ON uy.nguoi_dung_id = nd.nguoi_dung_id;

CREATE OR REPLACE VIEW vw_bao_cao_can_xu_ly AS
SELECT 
    bc.bao_cao_id,
    bc.nguoi_bao_cao_id,
    bc.nguoi_dung_bi_bao_cao_id,
    bc.bai_dang_bi_bao_cao_id,
    bc.loai_bao_cao,
    bc.ly_do_vi_pham,
    bc.mo_ta_chi_tiet,
    bc.minh_chung,
    bc.trang_thai_xu_ly,
    bc.ngay_bao_cao,
    bc.ngay_cap_nhat
FROM bao_cao_vi_pham bc
WHERE bc.trang_thai_xu_ly IN ('CHO_KIEM_DUYET', 'DANG_XU_LY', 'CHO_BO_SUNG_MINH_CHUNG');

CREATE OR REPLACE VIEW vw_giao_dich_dang_thuc_hien AS
SELECT 
    gd.giao_dich_id,
    gd.de_xuat_id,
    gd.nguoi_so_huu_id,
    gd.nguoi_tiep_nhan_id,
    gd.so_luong_giao_dich,
    gd.thoi_gian_ban_giao,
    gd.dia_diem_ban_giao,
    gd.xac_nhan_nguoi_so_huu,
    gd.xac_nhan_nguoi_tiep_nhan,
    gd.trang_thai,
    gd.ngay_tao,
    gd.ngay_cap_nhat
FROM giao_dich gd
WHERE gd.trang_thai IN ('CHO_BAN_GIAO', 'CHO_BEN_CON_LAI_XAC_NHAN');

-- --------------------------------------------------------
-- DATABASE INDEXES (DSD Section VI)
-- --------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_nguoi_dung_email ON nguoi_dung(email);
CREATE INDEX IF NOT EXISTS idx_nguoi_dung_sdt ON nguoi_dung(so_dien_thoai);
CREATE INDEX IF NOT EXISTS idx_bai_dang_chu_so_huu ON bai_dang_tai_san(chu_so_huu_id);
CREATE INDEX IF NOT EXISTS idx_bai_dang_danh_muc ON bai_dang_tai_san(danh_muc_id);
CREATE INDEX IF NOT EXISTS idx_bai_dang_trang_thai ON bai_dang_tai_san(trang_thai);
CREATE INDEX IF NOT EXISTS idx_de_xuat_bai_dang ON de_xuat_giao_dich(bai_dang_id);
CREATE INDEX IF NOT EXISTS idx_de_xuat_nguoi_gui ON de_xuat_giao_dich(nguoi_gui_id);
CREATE INDEX IF NOT EXISTS idx_de_xuat_trang_thai ON de_xuat_giao_dich(trang_thai);
CREATE INDEX IF NOT EXISTS idx_tin_nhan_de_xuat ON tin_nhan_thuong_luong(de_xuat_id);
CREATE INDEX IF NOT EXISTS idx_giao_dich_so_huu ON giao_dich(nguoi_so_huu_id);
CREATE INDEX IF NOT EXISTS idx_giao_dich_tiep_nhan ON giao_dich(nguoi_tiep_nhan_id);
CREATE INDEX IF NOT EXISTS idx_giao_dich_trang_thai ON giao_dich(trang_thai);
CREATE INDEX IF NOT EXISTS idx_danh_gia_nguoi_duoc_danh_gia ON danh_gia(nguoi_duoc_danh_gia_id);

-- --------------------------------------------------------
-- INITIAL SEEDING
-- --------------------------------------------------------

INSERT INTO danh_muc_tai_san (ten_danh_muc, mo_ta, trang_thai)
VALUES 
    ('Đồ điện tử', 'Tivi, tủ lạnh, điện thoại, máy tính, phụ kiện điện tử...', 'HOAT_DONG'),
    ('Đồ gia dụng', 'Bàn ghế, tủ quần áo, nồi chảo, vật dụng gia đình...', 'HOAT_DONG'),
    ('Thời trang & Phụ kiện', 'Quần áo, giày dép, túi xách, đồng hồ...', 'HOAT_DONG'),
    ('Sách & Văn phòng phẩm', 'Sách giáo khoa, tiểu thuyết, truyện tranh, dụng cụ học tập...', 'HOAT_DONG'),
    ('Mẹ & Bé', 'Xe đẩy, đồ chơi, nôi em bé, quần áo trẻ em...', 'HOAT_DONG'),
    ('Thể thao & Dã ngoại', 'Xe đạp, lều dã ngoại, dụng cụ tập gym, bóng đá...', 'HOAT_DONG'),
    ('Khác', 'Các vật dụng và tài sản cộng đồng khác...', 'HOAT_DONG')
ON CONFLICT (ten_danh_muc) DO NOTHING;
