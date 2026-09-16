import React, { useEffect, useState } from 'react';
import { RotateCw, FileDown, Sliders } from 'lucide-react';
import {
  Member,
  KtaCardSettings,
  KtaDataFieldConfig
} from '../../types';
import {
  SakaLogo,
  formatDriveImageUrl
} from '../common/SakaLogo';
import {
  storage,
  DEFAULT_KTA_SETTINGS
} from '../../services/storage';
import {
  KtaQrCode,
  getMemberVerificationUrl
} from './KtaQrCode';

interface Props {
  member: Member;
  onVerifyClick?: (member: Member) => void;
  onEditCard?: () => void;
  onEditPhoto?: (member: Member) => void;
  onEditMemberProfile?: (member: Member) => void;
  onPrintPdf?: (member: Member) => void;
  showControls?: boolean;
  allowAdminEdit?: boolean;
  previewSettings?: KtaCardSettings;
  onPreviewSettingsChange?: (
    settings: KtaCardSettings
  ) => void;
}

const valueOf = (
  member: Member,
  field: KtaDataFieldConfig['field']
): string => {
  const values: Record<string, any> = {
    fullName: member.fullName,
    id: member.id,
    nationalMemberNumber:
      member.nationalMemberNumber,
    currentPosition: member.currentPosition,
    provinceName: member.provinceName,
    regencyName: member.regencyName,
    districtName: member.districtName,
    branchName: member.branchName,
    gugusDepan: member.gugusDepan,
    krida: member.krida,
    phone: member.phone,
    email: member.email,
    joinYear: member.joinYear,
    status: member.status
  };

  const value = String(values[field] ?? '');

  if (field === 'currentPosition') {
    return value.toUpperCase();
  }

  if (field === 'provinceName') {
    return value.replace(/Kwartir Nasional/gi, 'KWARTIR NASIONAL').toUpperCase();
  }

  if (field === 'regencyName') {
    return value
      .replace(/KWARTIR NASIONAL\s*\(PUSAT\)/gi, 'TINGKAT NASIONAL')
      .replace(/^PUSAT NASIONAL$/i, 'TINGKAT NASIONAL')
      .toUpperCase();
  }

  if (field === 'districtName' && /^(nasional|pusat nasional)$/i.test(value.trim())) {
    return 'TINGKAT NASIONAL';
  }

  if (field === 'krida') {
    return value.toUpperCase();
  }

  return value;
};

const weight = (
  w: KtaDataFieldConfig['fontWeight'] | string
) =>
  ({
    normal: 400,
    medium: 500,
    bold: 700,
    black: 900
  } as any)[w] || 400;

export const DigitalMemberCard: React.FC<Props> = ({
  member,
  onEditCard,
  onPrintPdf,
  showControls = true,
  allowAdminEdit = false,
  previewSettings,
  onPreviewSettingsChange
}) => {
  const normalizeSettings = (
    value?: Partial<KtaCardSettings> | null
  ): KtaCardSettings => {
    const merged = {
      ...DEFAULT_KTA_SETTINGS,
      ...(value &&
      typeof value === 'object'
        ? value
        : {})
    } as KtaCardSettings;

    return {
      ...merged,
      logos: Array.isArray(merged.logos)
        ? merged.logos
        : [],
      dataFields: Array.isArray(
        merged.dataFields
      )
        ? merged.dataFields
        : [],
      textElements: Array.isArray(
        merged.textElements
      )
        ? merged.textElements
        : [],
      terms: Array.isArray(merged.terms)
        ? merged.terms
        : []
    };
  };

  const [settings, setSettings] =
    useState<KtaCardSettings>(() =>
      normalizeSettings(
        previewSettings ||
          storage.getKtaSettings()
      )
    );

  const [flipped, setFlipped] =
    useState(false);

  useEffect(() => {
    if (previewSettings) {
      setSettings(
        normalizeSettings(previewSettings)
      );
      return;
    }

    let disposed = false;
    let timer:
      | ReturnType<typeof setInterval>
      | null = null;

    const applyLocal = () =>
      setSettings(
        normalizeSettings(
          storage.getKtaSettings()
        )
      );

    const applyRemote = async () => {
      try {
        const {
          spreadsheetService
        } = await import(
          '../../services/spreadsheetService'
        );

        const remote =
          await spreadsheetService.refreshKtaSettings();

        if (!disposed && remote) {
          setSettings(
            normalizeSettings(remote)
          );
        }
      } catch (error) {
        console.warn(
          '[KTA Settings] Refresh remote gagal:',
          error
        );
      }
    };

    applyLocal();
    void applyRemote();

    const unsub =
      storage.subscribe(applyLocal);

    const evt = (e: Event) => {
      const detail = (
        e as CustomEvent
      ).detail;

      if (detail) {
        setSettings(
          normalizeSettings(detail)
        );
      }
    };

    const refreshOnFocus = () => {
      void applyRemote();
    };

    window.addEventListener(
      'saka:kta-settings-updated',
      evt
    );

    window.addEventListener(
      'focus',
      refreshOnFocus
    );

    window.addEventListener(
      'online',
      refreshOnFocus
    );

    timer = setInterval(() => {
      void applyRemote();
    }, 15000);

    return () => {
      disposed = true;

      unsub();

      window.removeEventListener(
        'saka:kta-settings-updated',
        evt
      );

      window.removeEventListener(
        'focus',
        refreshOnFocus
      );

      window.removeEventListener(
        'online',
        refreshOnFocus
      );

      if (timer) {
        clearInterval(timer);
      }
    };
  }, [previewSettings]);

  const members = storage.getMembers();

  const dataFields = Array.isArray(
    settings?.dataFields
  )
    ? settings.dataFields
    : [];

  const textElements = Array.isArray(
    settings?.textElements
  )
    ? settings.textElements
    : [];

  const logos = Array.isArray(
    settings?.logos
  )
    ? settings.logos
    : [];

  const terms = Array.isArray(
    settings?.terms
  )
    ? settings.terms
    : [];

  /*
   * =========================================================
   * PENANDATANGAN
   * =========================================================
   *
   * signerMemberId menjadi sumber identitas utama.
   *
   * Nama dan jabatan diambil langsung dari anggota
   * yang dipilih sebagai signerMemberId.
   *
   * signerName / signerTitle hanya menjadi fallback
   * untuk kompatibilitas data lama.
   * =========================================================
   */

  const signerMemberId = String(
    (settings as any)?.signerMemberId ||
      ''
  );

  const signerMember = signerMemberId
    ? members.find(
        m =>
          String(m.id) ===
          signerMemberId
      )
    : undefined;

  const signerName =
    signerMember?.fullName ||
    String(
      (settings as any)?.signerName ||
        ''
    );

  const signerTitle =
    signerMember?.currentPosition ||
    String(
      (settings as any)?.signerTitle ||
        ''
    );

  const ratio = Math.max(
    0.45,
    (settings?.widthMm || 85.6) /
      Math.max(
        settings?.heightMm || 53.98,
        1
      )
  );

  const widthPx = 380;
  const heightPx = widthPx / ratio;

  const photo =
    formatDriveImageUrl(
      member.avatarUrl
    ) ||
    member.avatarUrl;

  const frontFields =
    dataFields.filter(
      f =>
        f.side === 'FRONT' &&
        f.visible
    );

  const backFields =
    dataFields.filter(
      f =>
        f.side === 'BACK' &&
        f.visible
    );

  const frontTexts =
    textElements.filter(
      t => t.side === 'FRONT'
    );

  const backTexts =
    textElements.filter(
      t => t.side === 'BACK'
    );

  const frontLogos =
    logos.filter(
      l =>
        l.side === 'FRONT' &&
        l.url
    );

  const backLogos =
    logos.filter(
      l =>
        l.side === 'BACK' &&
        l.url
    );

  const bgFront =
    settings.frontBackgroundUrl ||
    settings.bgImageUrl;

  const bgBack =
    settings.backBackgroundUrl ||
    settings.bgImageUrl;

  const radius = Math.max(
    8,
    settings.cornerRadiusMm * 3
  );

  const updatePreviewSetting = (
    patch: Partial<KtaCardSettings>
  ) => {
    if (!onPreviewSettingsChange) {
      return;
    }

    onPreviewSettingsChange({
      ...settings,
      ...patch
    });
  };

  /*
   * =========================================================
   * DRAG QR DEPAN
   * =========================================================
   */

  const handleQrPointerDown = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (
      !onPreviewSettingsChange ||
      !previewSettings ||
      !settings.showQrCode
    ) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const target = e.currentTarget;

    target.setPointerCapture?.(
      e.pointerId
    );

    const rect =
      target.parentElement?.getBoundingClientRect();

    if (
      !rect ||
      rect.width <= 0 ||
      rect.height <= 0
    ) {
      return;
    }

    const startX = e.clientX;
    const startY = e.clientY;

    const startQrX = Number(
      settings.qrX ?? 78
    );

    const startQrY = Number(
      settings.qrY ?? 30
    );

    const qrPercent = Math.max(
      5,
      Math.min(
        60,
        Number(
          settings.qrSize ?? 22
        )
      )
    );

    const move = (
      ev: PointerEvent
    ) => {
      const nextX = Math.max(
        0,
        Math.min(
          100 - qrPercent,
          startQrX +
            ((ev.clientX -
              startX) /
              rect.width) *
              100
        )
      );

      const nextY = Math.max(
        0,
        Math.min(
          100 - qrPercent,
          startQrY +
            ((ev.clientY -
              startY) /
              rect.height) *
              100
        )
      );

      updatePreviewSetting({
        qrX: Number(
          nextX.toFixed(2)
        ),
        qrY: Number(
          nextY.toFixed(2)
        )
      });
    };

    const up = () => {
      window.removeEventListener(
        'pointermove',
        move
      );

      window.removeEventListener(
        'pointerup',
        up
      );
    };

    window.addEventListener(
      'pointermove',
      move
    );

    window.addEventListener(
      'pointerup',
      up,
      { once: true }
    );
  };

  /*
   * =========================================================
   * RENDER DATA FIELD
   * =========================================================
   */

  const renderField = (
    f: KtaDataFieldConfig
  ) => {
    const raw = valueOf(
      member,
      f.field
    );

    const text =
      f.textTransform ===
      'uppercase'
        ? raw.toUpperCase()
        : raw;

    const showLabel =
      f.showLabel === true;

    return (
      <div
        key={f.id}
        className="absolute overflow-hidden"
        style={{
          left: `${f.x}%`,
          top: `${f.y}%`,
          width: `${f.width}%`,
          fontSize: `${f.fontSize}px`,
          fontWeight: weight(
            f.fontWeight
          ),
          color: f.color,
          textAlign:
            f.align || 'left',
          lineHeight: Number(
            (f as any).lineHeight ??
              1.15
          ),
          letterSpacing: `${
            (f as any)
              .letterSpacing ?? 0
          }px`,
          whiteSpace:
            (f as any).whiteSpace ===
            'normal'
              ? 'normal'
              : 'nowrap',
          textOverflow:
            'ellipsis',
          wordBreak:
            'break-word'
        }}
        title={text}
      >
        {showLabel &&
          f.label && (
            <span
              style={{
                opacity: 0.75,
                marginRight: 5,
                fontSize:
                  Math.max(
                    7,
                    f.fontSize *
                      0.68
                  )
              }}
            >
              {f.label}:
            </span>
          )}

        {text || '—'}
      </div>
    );
  };

  /*
   * =========================================================
   * RENDER TEXT CUSTOM
   * =========================================================
   */

  const renderText = (
    t: any
  ) => (
    <div
      key={t.id}
      className="absolute overflow-hidden"
      style={{
        left: `${t.x}%`,
        top: `${t.y}%`,
        width: `${t.width}%`,
        fontSize: `${t.fontSize}px`,
        fontWeight: weight(
          t.fontWeight
        ),
        color: t.color,
        textAlign:
          t.align || 'left',
        lineHeight: Number(
          t.lineHeight ?? 1.2
        ),
        letterSpacing: `${
          t.letterSpacing ?? 0
        }px`,
        whiteSpace:
          t.whiteSpace || 'normal',
        textTransform:
          t.textTransform || 'none',
        wordBreak:
          'break-word'
      }}
    >
      {t.text}
    </div>
  );

  /*
   * =========================================================
   * RENDER LOGOS
   * =========================================================
   */

  const renderLogos = (
    logoItems: any[]
  ) => (
    <>
      {logoItems.map(l => (
        <img
          key={l.id}
          src={
            formatDriveImageUrl(
              l.url
            ) || l.url
          }
          alt={l.name}
          className="absolute pointer-events-none"
          style={{
            left: `${l.x}%`,
            top: `${l.y}%`,
            width: `${l.width}%`,
            height: `${l.height}%`,
            opacity: l.opacity,
            objectFit:
              l.objectFit ||
              'contain'
          }}
        />
      ))}
    </>
  );

  /*
   * =========================================================
   * BACKGROUND
   * =========================================================
   */

  const bgStyle = (
    url?: string,
    color?: string
  ): React.CSSProperties => ({
    backgroundColor:
      color || '#24105b',
    backgroundImage: url
      ? `linear-gradient(rgba(0,0,0,.12),rgba(0,0,0,.12)),url("${formatDriveImageUrl(url) || url}")`
      : undefined,
    backgroundSize: 'cover',
    backgroundPosition:
      'center'
  });

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      <div
        style={{
          width: widthPx,
          height: heightPx,
          perspective: '1000px'
        }}
        className="cursor-pointer"
        onClick={() =>
          setFlipped(v => !v)
        }
      >
        <div
          className="relative w-full h-full transition-transform duration-500"
          style={{
            transformStyle:
              'preserve-3d',
            transform: flipped
              ? 'rotateY(180deg)'
              : 'none'
          }}
        >

          {/* =====================================================
              DEPAN KTA
          ====================================================== */}

          <div
            data-kta-render-side="front"
            data-kta-member-id={member.id}
            className="absolute inset-0 overflow-hidden shadow-2xl border border-white/20 text-white"
            style={{
              ...bgStyle(
                bgFront,
                settings.customBackgroundColorFront
              ),
              borderRadius: radius,
              backfaceVisibility:
                'hidden'
            }}
          >
            <div
              className="absolute inset-0 bg-black/10"
              style={{
                opacity:
                  settings.bgOpacity ??
                  0.1
              }}
            />

            {renderLogos(
              frontLogos
            )}

            {!frontLogos.length && (
              <div className="absolute left-[4%] top-[5%]">
                <SakaLogo size={38} />
              </div>
            )}

            {/* =================================================
                HEADER ORGANISASI
            ================================================== */}

            <div
              className="absolute overflow-hidden"
              style={{
                left: `${
                  (settings as any)
                    .frontOrganizationTitleX ??
                  15
                }%`,
                top: `${
                  (settings as any)
                    .frontOrganizationTitleY ??
                  6
                }%`,
                width: `${
                  (settings as any)
                    .frontOrganizationTitleWidth ??
                  65
                }%`,
                fontSize: `${
                  (settings as any)
                    .frontOrganizationTitleFontSize ??
                  11
                }px`,
                fontWeight: weight(
                  (settings as any)
                    .frontOrganizationTitleFontWeight ??
                    'bold'
                ),
                color:
                  (settings as any)
                    .frontOrganizationTitleColor ??
                  '#ffffff',
                textAlign:
                  (settings as any)
                    .frontOrganizationTitleAlign ??
                  'left',
                lineHeight: Number(
                  (settings as any)
                    .frontOrganizationTitleLineHeight ??
                    1.15
                ),
                letterSpacing: `${
                  (settings as any)
                    .frontOrganizationTitleLetterSpacing ??
                  0
                }px`,
                whiteSpace:
                  'normal',
                textTransform:
                  'uppercase',
                wordBreak:
                  'break-word'
              }}
            >
              {
                settings.frontOrganizationTitle
              }
            </div>

            <div
              className="absolute overflow-hidden"
              style={{
                left: `${
                  (settings as any)
                    .frontOrganizationSubtitleX ??
                  15
                }%`,
                top: `${
                  (settings as any)
                    .frontOrganizationSubtitleY ??
                  12
                }%`,
                width: `${
                  (settings as any)
                    .frontOrganizationSubtitleWidth ??
                  70
                }%`,
                fontSize: `${
                  (settings as any)
                    .frontOrganizationSubtitleFontSize ??
                  8
                }px`,
                fontWeight: weight(
                  (settings as any)
                    .frontOrganizationSubtitleFontWeight ??
                    'normal'
                ),
                color:
                  (settings as any)
                    .frontOrganizationSubtitleColor ??
                  '#e5e7eb',
                textAlign:
                  (settings as any)
                    .frontOrganizationSubtitleAlign ??
                  'left',
                lineHeight: Number(
                  (settings as any)
                    .frontOrganizationSubtitleLineHeight ??
                    1.2
                ),
                letterSpacing: `${
                  (settings as any)
                    .frontOrganizationSubtitleLetterSpacing ??
                  0
                }px`,
                whiteSpace:
                  'normal',
                wordBreak:
                  'break-word'
              }}
            >
              {
                settings.frontOrganizationSubtitle
              }
            </div>

            {/* =================================================
                FOTO ANGGOTA

                Border kuning dihilangkan.
                Default border sekarang putih.
            ================================================== */}

            {settings.showPhoto && (
              <div
                className="absolute overflow-hidden bg-slate-800"
                style={{
                  left: `${
                    (settings as any)
                      .photoX ?? 4
                  }%`,
                  top: `${
                    (settings as any)
                      .photoY ?? 27
                  }%`,
                  width: `${
                    (settings as any)
                      .photoWidth ?? 22
                  }%`,
                  height: `${
                    (settings as any)
                      .photoHeight ?? 48
                  }%`,
                  borderRadius: `${
                    (settings as any)
                      .photoRadius ?? 12
                  }px`,
                  borderWidth: `${
                    (settings as any)
                      .photoBorderWidth ?? 2
                  }px`,
                  borderStyle:
                    'solid',

                  /*
                   * PERUBAHAN:
                   * Tidak lagi menggunakan #fcd34d
                   * sebagai default border foto.
                   */
                  borderColor:
                    (settings as any)
                      .photoBorderColor ??
                    '#ffffff'
                }}
              >
                <img
                  src={photo}
                  alt={member.fullName}
                  className="w-full h-full"
                  style={{
                    objectFit:
                      (settings as any)
                        .photoObjectFit ||
                      'cover'
                  }}
                />
              </div>
            )}

            {/* =================================================
                QR CODE DEPAN
            ================================================== */}

            {settings.showQrCode &&
              (() => {
                const qrPercent =
                  Math.max(
                    5,
                    Math.min(
                      60,
                      Number(
                        settings.qrSize ??
                          22
                      )
                    )
                  );

                const qrX =
                  Math.max(
                    0,
                    Math.min(
                      100 -
                        qrPercent,
                      Number(
                        settings.qrX ??
                          78
                      )
                    )
                  );

                const qrY =
                  Math.max(
                    0,
                    Math.min(
                      100 -
                        qrPercent,
                      Number(
                        settings.qrY ??
                          30
                      )
                    )
                  );

                const qrPx =
                  Math.max(
                    36,
                    Math.round(
                      Math.min(
                        widthPx,
                        heightPx
                      ) *
                        (qrPercent /
                          100)
                    )
                  );

                return (
                  <div
                    className={`absolute ${
                      onPreviewSettingsChange
                        ? 'cursor-move select-none'
                        : ''
                    }`}
                    onPointerDown={
                      handleQrPointerDown
                    }
                    title={
                      onPreviewSettingsChange
                        ? 'Seret untuk memindahkan QR Code'
                        : undefined
                    }
                    style={{
                      left: `${qrX}%`,
                      top: `${qrY}%`,
                      width: `${qrPercent}%`,
                      aspectRatio:
                        '1 / 1',
                      touchAction:
                        'none'
                    }}
                  >
                    <KtaQrCode
                      member={member}
                      size={Math.max(
                        24,
                        qrPx -
                          Math.max(
                            0,
                            Number(
                              settings.qrPadding ??
                                2
                            )
                          ) *
                            2
                      )}
                      showLabel={false}
                      interactive={false}
                      borderWidth={0}
                      borderRadius={0}
                      borderColor="transparent"
                      margin={4}
                      lightColor="#ffffff"
                    />
                  </div>
                );
              })()}

            {/* =================================================
                DATA FIELD DEPAN
            ================================================== */}

            {frontFields.map(
              renderField
            )}

            {/* =================================================
                TEKS CUSTOM DEPAN
            ================================================== */}

            {frontTexts.map(
              renderText
            )}

            {/* =================================================
                TEKS MASA BERLAKU
            ================================================== */}

            <div
              className="absolute overflow-hidden"
              style={{
                left: `${
                  (settings as any)
                    .frontValidityTextX ??
                  4
                }%`,
                top: `${
                  (settings as any)
                    .frontValidityTextY ??
                  92
                }%`,
                width: `${
                  (settings as any)
                    .frontValidityTextWidth ??
                  92
                }%`,
                fontSize: `${
                  (settings as any)
                    .frontValidityTextFontSize ??
                  7
                }px`,
                fontWeight: weight(
                  (settings as any)
                    .frontValidityTextFontWeight ??
                    'normal'
                ),
                color:
                  (settings as any)
                    .frontValidityTextColor ??
                  '#ffffff',
                textAlign:
                  (settings as any)
                    .frontValidityTextAlign ??
                  'left',
                lineHeight: Number(
                  (settings as any)
                    .frontValidityTextLineHeight ??
                    1.2
                ),
                letterSpacing: `${
                  (settings as any)
                    .frontValidityTextLetterSpacing ??
                  0
                }px`,
                whiteSpace:
                  'normal'
              }}
            >
              {
                settings.frontValidityText
              }
            </div>

            {/*
             * =================================================
             * BADGE KRIDA DIHAPUS
             * =================================================
             *
             * Blok berikut sengaja tidak dirender:
             *
             * settings.showKridaBadge
             *
             * sehingga kotak kuning dan teks Krida
             * tidak lagi muncul di depan KTA.
             */}
          </div>

          {/* =====================================================
              BELAKANG KTA

              URUTAN:
              1. Ketentuan
              2. Tempat & tanggal
              3. QR penandatangan
              4. Nama
              5. Jabatan
          ====================================================== */}

          <div
            data-kta-render-side="back"
            data-kta-member-id={member.id}
            className="absolute inset-0 overflow-hidden shadow-2xl border border-white/20 text-white p-4"
            style={{
              ...bgStyle(
                bgBack,
                settings.customBackgroundColorBack
              ),
              borderRadius: radius,
              backfaceVisibility:
                'hidden',
              transform:
                'rotateY(180deg)'
            }}
          >
            {renderLogos(
              backLogos
            )}

            {/* =================================================
                HEADER BELAKANG
            ================================================== */}

            <div
              className="absolute overflow-hidden"
              style={{
                left: `${
                  (settings as any)
                    .backHeaderTitleX ??
                  5
                }%`,
                top: `${
                  (settings as any)
                    .backHeaderTitleY ??
                  6
                }%`,
                width: `${
                  (settings as any)
                    .backHeaderTitleWidth ??
                  90
                }%`,
                fontSize: `${
                  (settings as any)
                    .backHeaderTitleFontSize ??
                  11
                }px`,
                fontWeight: weight(
                  (settings as any)
                    .backHeaderTitleFontWeight ??
                    'bold'
                ),
                color:
                  (settings as any)
                    .backHeaderTitleColor ??
                  '#ffffff',
                textAlign:
                  (settings as any)
                    .backHeaderTitleAlign ??
                  'left',
                lineHeight: Number(
                  (settings as any)
                    .backHeaderTitleLineHeight ??
                    1.15
                ),
                letterSpacing: `${
                  (settings as any)
                    .backHeaderTitleLetterSpacing ??
                  0
                }px`,
                whiteSpace:
                  'normal',
                wordBreak:
                  'break-word',
                textTransform:
                  'uppercase'
              }}
            >
              {
                settings.backHeaderTitle
              }
            </div>

            <div
              className="absolute overflow-hidden"
              style={{
                left: `${
                  (settings as any)
                    .backHeaderSubtitleX ??
                  5
                }%`,
                top: `${
                  (settings as any)
                    .backHeaderSubtitleY ??
                  14
                }%`,
                width: `${
                  (settings as any)
                    .backHeaderSubtitleWidth ??
                  90
                }%`,
                fontSize: `${
                  (settings as any)
                    .backHeaderSubtitleFontSize ??
                  8
                }px`,
                fontWeight: weight(
                  (settings as any)
                    .backHeaderSubtitleFontWeight ??
                    'normal'
                ),
                color:
                  (settings as any)
                    .backHeaderSubtitleColor ??
                  '#e5e7eb',
                textAlign:
                  (settings as any)
                    .backHeaderSubtitleAlign ??
                  'left',
                lineHeight: Number(
                  (settings as any)
                    .backHeaderSubtitleLineHeight ??
                    1.2
                ),
                letterSpacing: `${
                  (settings as any)
                    .backHeaderSubtitleLetterSpacing ??
                  0
                }px`,
                whiteSpace:
                  'normal',
                wordBreak:
                  'break-word'
              }}
            >
              {
                settings.backHeaderSubtitle
              }
            </div>

            {/* =================================================
                KETENTUAN
            ================================================== */}

            <div
              className="absolute overflow-hidden"
              style={{
                left: `${
                  (settings as any)
                    .termsX ?? 5
                }%`,
                top: `${
                  (settings as any)
                    .termsY ?? 25
                }%`,
                width: `${
                  (settings as any)
                    .termsWidth ?? 90
                }%`,
                fontSize: `${
                  (settings as any)
                    .termsFontSize ?? 7
                }px`,
                fontWeight: weight(
                  (settings as any)
                    .termsFontWeight ??
                    'normal'
                ),
                color:
                  (settings as any)
                    .termsColor ??
                  '#ffffff',
                textAlign:
                  (settings as any)
                    .termsAlign ??
                  'left',
                lineHeight: Number(
                  (settings as any)
                    .termsLineHeight ??
                    1.35
                ),
                letterSpacing: `${
                  (settings as any)
                    .termsLetterSpacing ??
                  0
                }px`,
                whiteSpace:
                  'normal',
                wordBreak:
                  'break-word'
              }}
            >
              {terms.map(
                (t, i) => (
                  <div
                    key={i}
                    className="mb-1"
                  >
                    {i + 1}. {t}
                  </div>
                )
              )}
            </div>

            {/* =================================================
                DATA FIELD BELAKANG
            ================================================== */}

            {backFields.map(
              renderField
            )}

            {/* =================================================
                TEKS CUSTOM BELAKANG
            ================================================== */}

            {backTexts.map(
              renderText
            )}

            {/* =================================================
                1. TEMPAT & TANGGAL

                Default Y = 62
            ================================================== */}

            <div
              className="absolute overflow-hidden"
              style={{
                left: `${
                  (settings as any)
                    .issueLocationDateX ??
                  5
                }%`,
                top: `${
                  (settings as any)
                    .issueLocationDateY ??
                  62
                }%`,
                width: `${
                  (settings as any)
                    .signerWidth ??
                  55
                }%`,
                color:
                  (settings as any)
                    .signerColor ??
                  '#ffffff',
                textAlign:
                  (settings as any)
                    .signerAlign ??
                  'left',
                lineHeight: Number(
                  (settings as any)
                    .signerLineHeight ??
                    1.2
                ),
                letterSpacing: `${
                  (settings as any)
                    .signerLetterSpacing ??
                  0
                }px`,
                whiteSpace:
                  'normal',
                wordBreak:
                  'break-word'
              }}
            >
              <div
                style={{
                  fontSize: `${
                    (settings as any)
                      .issueLocationDateFontSize ??
                    7
                  }px`
                }}
              >
                {
                  settings.issueLocationDate
                }
              </div>
            </div>

            {/* =================================================
                3. QR PENANDATANGAN

                Tidak ada:
                - badge
                - ShieldCheck
                - background dekoratif
                - border
                - label
                - "Tanda Tangan Terverifikasi"
            ================================================== */}

            {(
              settings as any
            ).showSignerQrCode !==
              false &&
              signerMember &&
              (() => {
                const qrPercent =
                  Math.max(
                    8,
                    Math.min(
                      35,
                      Number(
                        (settings as any)
                          .signerQrSize ??
                        18
                      )
                    )
                  );

                const qrX =
                  Math.max(
                    0,
                    Math.min(
                      100 -
                        qrPercent,
                      Number(
                        (settings as any)
                          .signerQrX ??
                        68
                      )
                    )
                  );

                const qrY =
                  Math.max(
                    0,
                    Math.min(
                      100 -
                        qrPercent,
                      Number(
                        (settings as any)
                          .signerQrY ??
                        68
                      )
                    )
                  );

                const qrPx =
                  Math.max(
                    36,
                    Math.round(
                      Math.min(
                        widthPx,
                        heightPx
                      ) *
                        (qrPercent /
                          100)
                    )
                  );

                const qrMargin =
                  Math.max(
                    0,
                    Number(
                      (settings as any)
                        .signerQrPadding ??
                      2
                    )
                  );

                return (
                  <div
                    className="absolute"
                    style={{
                      left: `${qrX}%`,
                      top: `${qrY}%`,
                      width: `${qrPercent}%`,
                      aspectRatio:
                        '1 / 1',
                      display:
                        'flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'center'
                    }}
                  >
                    <KtaQrCode
                      member={
                        signerMember
                      }
                      size={Math.max(
                        24,
                        qrPx
                      )}
                      showLabel={false}
                      interactive={false}
                      borderWidth={0}
                      borderRadius={0}
                      borderColor="transparent"
                      margin={
                        qrMargin
                      }
                      lightColor="#ffffff"
                    />
                  </div>
                );
              })()}

            {/* =================================================
                3 & 4. NAMA + JABATAN

                Default Y = 88

                Nama dan jabatan berasal dari signerMemberId.
            ================================================== */}

            {signerMember && (
              <div
                className="absolute overflow-hidden"
                style={{
                  left: `${
                    (settings as any)
                      .signerX ??
                    5
                  }%`,
                  top: `${
                    (settings as any)
                      .signerY ??
                    82
                  }%`,
                  width: `${
                    (settings as any)
                      .signerWidth ??
                    55
                  }%`,
                  color:
                    (settings as any)
                      .signerColor ??
                    '#ffffff',
                  textAlign:
                    (settings as any)
                      .signerAlign ??
                    'left',
                  lineHeight: Number(
                    (settings as any)
                      .signerLineHeight ??
                      1.2
                  ),
                  letterSpacing: `${
                    (settings as any)
                      .signerLetterSpacing ??
                    0
                  }px`,
                  whiteSpace:
                    'normal',
                  wordBreak:
                    'break-word'
                }}
              >
                {(settings as any).showSignerName !== false && (
                  <div
                    style={{
                      position: 'relative',
                      left: `${(settings as any).signerNameXOffset ?? 0}%`,
                      top: `${(settings as any).signerNameYOffset ?? 0}%`,
                      fontSize: `${(settings as any).signerNameFontSize ?? 9}px`,
                      fontWeight: 700
                    }}
                  >
                    {signerName}
                  </div>
                )}

                {(settings as any).showSignerTitle === true && (
                  <div
                    style={{
                      fontSize: `${(settings as any).signerTitleFontSize ?? 7}px`
                    }}
                  >
                    {signerTitle}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          CONTROL
      ====================================================== */}

      {showControls && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setFlipped(v => !v)
            }
            className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-semibold"
          >
            <RotateCw className="inline w-3.5 h-3.5 mr-1" />
            Lihat{' '}
            {flipped
              ? 'Depan'
              : 'Belakang'}
          </button>

          {onPrintPdf && (
            <button
              type="button"
              onClick={() =>
                onPrintPdf(member)
              }
              className="px-3 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-semibold"
            >
              <FileDown className="inline w-3.5 h-3.5 mr-1" />
              PDF
            </button>
          )}

          {allowAdminEdit &&
            onEditCard && (
              <button
                type="button"
                onClick={onEditCard}
                className="px-3 py-1.5 bg-purple-800 text-white rounded-xl text-xs font-semibold"
              >
                <Sliders className="inline w-3.5 h-3.5 mr-1" />
                Atur Desain
              </button>
            )}
        </div>
      )}
    </div>
  );
};

