-- SQL script for Views and Indexes according to Database Specification Document (DSD)

-- --------------------------------------------------------
-- DATABASE VIEWS
-- --------------------------------------------------------

-- 1. View bài đăng khả dụng
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

-- 2. View hồ sơ uy tín thành viên
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

-- 3. View báo cáo vi phạm cần xử lý
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

-- 4. View giao dịch đang thực hiện
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
