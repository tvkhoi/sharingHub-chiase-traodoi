// TypeScript interfaces matching Backend Database Specification Document (DSD)

export type UserRole = 'THANH_VIEN' | 'QUAN_TRI_VIEN';
export type UserStatus = 'CHO_XAC_THUC' | 'HOAT_DONG' | 'BI_KHOA';
export type ShareType = 'CHO_TANG' | 'TRAO_DOI';
export type TradeType = 'TAI_SAN' | 'TIEN';
export type AssetStatus = 'KHA_DUNG' | 'DANG_THUONG_LUONG' | 'DA_KHOA_SO' | 'DA_KET_THUC';
export type ProposalStatus = 'CHO_XU_LY' | 'DANG_THUONG_LUONG' | 'DA_CHAP_NHAN' | 'TU_CHOI' | 'DA_HUY';
export type TransactionStatus = 'CHO_BAN_GIAO' | 'DANG_GIAO' | 'HOAN_TAT' | 'DA_HUY';
export type ReportType = 'BAI_DANG' | 'NGUOI_DUNG';
export type ReportStatus = 'CHO_KIEM_DUYET' | 'DA_XU_LY' | 'TU_CHOI';
export type ActionType = 'KHONG_VI_PHAM' | 'AN_BAI_DANG' | 'KHOA_TAI_KHOAN';

export interface UserProfile {
  ho_ten: string;
  so_dien_thoai?: string | null;
  dia_chi?: string | null;
  mo_ta_ca_nhan?: string | null;
  anh_dai_dien?: string | null;
  ngay_cap_nhat?: string;
}

export interface ReputationProfile {
  uy_tin_id?: string;
  nguoi_dung_id: string;
  diem_trung_binh: number;
  tong_so_danh_gia: number;
  so_giao_dich_hoan_tat: number;
  ngay_cap_nhat?: string;
}

export interface User {
  nguoi_dung_id: string;
  email: string;
  so_dien_thoai?: string | null;
  vai_tro: UserRole;
  trang_thai: UserStatus;
  ngay_tao?: string;
  ho_so?: UserProfile | null;
  uy_tin?: ReputationProfile | null;
}

export interface AssetCategory {
  danh_muc_id: string;
  ten_danh_muc: string;
  mo_ta?: string | null;
  bieu_tuong?: string | null;
}

export interface AssetImage {
  hinh_anh_id: string;
  bai_dang_id: string;
  duong_dan_anh: string;
  thu_tu_hien_thi: number;
}

export interface Asset {
  bai_dang_id: string;
  chu_so_huu_id: string;
  danh_muc_id: string;
  ten_tai_san: string;
  mo_ta_hien_trang: string;
  so_luong_tong: number;
  so_luong_kha_dung: number;
  so_luong_giu_cho: number;
  so_luong_da_phan_phoi: number;
  dia_diem: string;
  hinh_thuc_chia_se: ShareType;
  hinh_thuc_trao_doi?: TradeType | null;
  trang_thai: AssetStatus;
  ngay_tao: string;
  ngay_cap_nhat?: string;
  chu_so_huu?: Partial<User>;
  danh_muc?: AssetCategory;
  hinh_anh?: AssetImage[];
}

export interface Proposal {
  de_xuat_id: string;
  bai_dang_id: string;
  nguoi_gui_id: string;
  so_luong_yeu_cau: number;
  loi_nhan?: string | null;
  tai_san_doi_ung?: string | null;
  tien_doi_ung?: number | null;
  trang_thai: ProposalStatus;
  ly_do_tu_choi?: string | null;
  ngay_gui: string;
  ngay_cap_nhat?: string;
  bai_dang?: Asset;
  nguoi_gui?: Partial<User>;
}

export interface NegotiationMessage {
  tin_nhan_id: string;
  de_xuat_id: string;
  nguoi_gui_id: string;
  noi_dung: string;
  thoi_gian_gui: string;
  trang_thai?: string;
  nguoi_gui?: Partial<User>;
}

export interface Transaction {
  giao_dich_id: string;
  de_xuat_id: string;
  nguoi_so_huu_id: string;
  nguoi_tiep_nhan_id: string;
  so_luong_giao_dich: number;
  trang_thai: TransactionStatus;
  xac_nhan_nguoi_so_huu: boolean;
  xac_nhan_nguoi_tiep_nhan: boolean;
  ly_do_huy?: string;
  ngay_tao: string;
  ngay_cap_nhat?: string;
  de_xuat?: Proposal;
  nguoi_so_huu?: Partial<User>;
  nguoi_tiep_nhan?: Partial<User>;
  danh_gia?: Review[];
}

export interface Review {
  danh_gia_id: string;
  giao_dich_id: string;
  nguoi_danh_gia_id: string;
  nguoi_nhan_danh_gia_id: string;
  diem_sao: number;
  nhan_xet?: string | null;
  ngay_danh_gia: string;
  nguoi_danh_gia?: Partial<User>;
}

export interface PenaltyAction {
  bien_phap_id: string;
  bao_cao_id: string;
  quan_tri_vien_id: string;
  loai_bien_phap: ActionType;
  noi_dung_xu_ly: string;
  thoi_gian_xu_ly: string;
}

export interface Report {
  bao_cao_id: string;
  nguoi_bao_cao_id: string;
  nguoi_dung_bi_bao_cao_id?: string | null;
  bai_dang_bi_bao_cao_id?: string | null;
  loai_bao_cao: ReportType;
  ly_do_vi_pham: string;
  mo_ta_chi_tiet: string;
  minh_chung?: string | null;
  trang_thai_xu_ly: ReportStatus;
  ngay_bao_cao: string;
  nguoi_bao_cao?: Partial<User>;
  nguoi_dung_bi_bao_cao?: Partial<User>;
  bai_dang_bi_bao_cao?: Asset;
  bien_phap?: PenaltyAction[];
}
