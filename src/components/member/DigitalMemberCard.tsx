import React, { useEffect, useState } from 'react';
import {
  RotateCw,
  FileDown,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import {
  Member,
  KtaCardSettings,
  KtaDataFieldConfig
} from '../../types';
import {
  SakaLogo,
  formatDriveImageUrl
} from '../common/SakaLogo';
import { Barcode } from '../common/Barcode';
import { storage } from '../../services/storage';
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
    currentPosition:
      member.currentPosition,
    provinceName:
      member.provinceName,
    regencyName:
      member.regencyName,
    districtName:
      member.districtName,
    branchName:
      member.branchName,
    gugusDepan:
      member.gugusDepan,
    krida:
      member.krida,
    phone:
      member.phone,
    email:
      member.email,
    joinYear:
      member.joinYear,
    status:
      member.status
  };

  return String(values[field] ?? '');
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
  previewSettings
}) => {
  const [settings, setSettings] =
    useState<KtaCardSettings>(
      previewSettings ||
        storage.getKtaSettings()
    );

  const [flipped, setFlipped] =
    useState(false);

  useEffect(() => {
    if (previewSettings) {
      setSettings(previewSettings);
      return;
    }

    const refresh = () => {
      setSettings(
        storage.getKtaSettings()
      );
    };

    const unsub = storage.subscribe(
      refresh
    );

    const evt = (e: any) => {
      if (e.detail) {
        setSettings(e.detail);
      }
    };

    window.addEventListener(
      'saka:kta-settings-updated',
      evt
    );

    return () => {
      unsub();

      window.removeEventListener(
        'saka:kta-settings-updated',
        evt
      );
    };
  }, [previewSettings]);

  const dataFields =
    Array.isArray(settings?.dataFields)
      ? settings.dataFields
      : [];

  const textElements =
    Array.isArray(settings?.textElements)
      ? settings.textElements
      : [];

  const logos =
    Array.isArray(settings?.logos)
      ? settings.logos
      : [];

  const terms =
    Array.isArray(settings?.terms)
      ? settings.terms
      : [];

  const ratio =
    Math.max(
      0.45,
      (settings?.widthMm || 85.6) /
        Math.max(
          settings?.heightMm || 53.98,
          1
        )
    );

  const widthPx = 380;
  const heightPx =
    widthPx / ratio;

  const photo =
    formatDriveImageUrl(
      member.avatarUrl
    ) || member.avatarUrl;

  const frontFields =
    dataFields.filter(
      (f) =>
        f.side === 'FRONT' &&
        f.visible
    );

  const backFields =
    dataFields.filter(
      (f) =>
        f.side === 'BACK' &&
        f.visible
    );

  const frontTexts =
    textElements.filter(
      (t) =>
        t.side === 'FRONT'
    );

  const backTexts =
    textElements.filter(
      (t) =>
        t.side === 'BACK'
    );

  const frontLogos =
    logos.filter(
      (l) =>
        l.side === 'FRONT' &&
        l.url
    );

  const backLogos =
    logos.filter(
      (l) =>
        l.side === 'BACK' &&
        l.url
    );

  const bgFront =
    settings.frontBackgroundUrl ||
    settings.bgImageUrl;

  const bgBack =
    settings.backBackgroundUrl ||
    settings.bgImageUrl;

  const radius =
    Math.max(
      8,
      settings.cornerRadiusMm * 3
    );

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
          letterSpacing: `${(f as any).letterSpacing ?? 0}px`,
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
        f.label ? (
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
        ) : null}

        {text || '—'}
      </div>
    );
  };

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
        letterSpacing: `${t.letterSpacing ?? 0}px`,
        whiteSpace:
          t.whiteSpace || 'normal',
        textTransform:
          t.textTransform ||
          'none',
        wordBreak:
          'break-word'
      }}
    >
      {t.text}
    </div>
  );

  const renderLogos = (
    logoItems: any[]
  ) => (
    <>
      {logoItems.map((l) => (
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

  const bgStyle = (
    url?: string,
    color?: string
  ): React.CSSProperties => ({
    backgroundColor:
      color || '#24105b',

    backgroundImage: url
      ? `linear-gradient(rgba(0,0,0,.12),rgba(0,0,0,.12)),url("${formatDriveImageUrl(url) || url}")`
      : undefined,

    backgroundSize:
      'cover',

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
          setFlipped(
            (value) => !value
          )
        }
      >
        <div
          className="relative w-full h-full transition-transform duration-500"
          style={{
            transformStyle:
              'preserve-3d',
            transform:
              flipped
                ? 'rotateY(180deg)'
                : 'none'
          }}
        >

          {/* ================================
              DEPAN KARTU
          ================================= */}

          <div
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

            {!frontLogos.length ? (
              <div className="absolute left-[4%] top-[5%]">
                <SakaLogo size={38} />
              </div>
            ) : null}

            <div
              className="absolute overflow-hidden"
              style={{
                left: `${(settings as any).frontOrganizationTitleX ?? 15}%`,
                top: `${(settings as any).frontOrganizationTitleY ?? 6}%`,
                width: `${(settings as any).frontOrganizationTitleWidth ?? 65}%`,
                fontSize: `${(settings as any).frontOrganizationTitleFontSize ?? 11}px`,
                fontWeight: weight(
                  (settings as any).frontOrganizationTitleFontWeight ?? 'bold'
                ),
                color:
                  (settings as any).frontOrganizationTitleColor ??
                  '#ffffff',
                textAlign:
                  (settings as any).frontOrganizationTitleAlign ??
                  'left',
                lineHeight: Number(
                  (settings as any).frontOrganizationTitleLineHeight ??
                    1.15
                ),
                letterSpacing: `${(settings as any).frontOrganizationTitleLetterSpacing ?? 0}px`,
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
                left: `${(settings as any).frontOrganizationSubtitleX ?? 15}%`,
                top: `${(settings as any).frontOrganizationSubtitleY ?? 12}%`,
                width: `${(settings as any).frontOrganizationSubtitleWidth ?? 70}%`,
                fontSize: `${(settings as any).frontOrganizationSubtitleFontSize ?? 8}px`,
                fontWeight: weight(
                  (settings as any).frontOrganizationSubtitleFontWeight ??
                    'normal'
                ),
                color:
                  (settings as any).frontOrganizationSubtitleColor ??
                  '#e5e7eb',
                textAlign:
                  (settings as any).frontOrganizationSubtitleAlign ??
                  'left',
                lineHeight: Number(
                  (settings as any).frontOrganizationSubtitleLineHeight ??
                    1.2
                ),
                letterSpacing: `${(settings as any).frontOrganizationSubtitleLetterSpacing ?? 0}px`,
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

            {/* FOTO ANGGOTA */}

            {settings.showPhoto ? (
              <div
                className="absolute overflow-hidden bg-slate-800"
                style={{
                  left: `${(settings as any).photoX ?? 4}%`,
                  top: `${(settings as any).photoY ?? 27}%`,
                  width: `${(settings as any).photoWidth ?? 22}%`,
                  height: `${(settings as any).photoHeight ?? 48}%`,
                  borderRadius: `${(settings as any).photoRadius ?? 12}px`,
                  borderWidth: `${(settings as any).photoBorderWidth ?? 2}px`,
                  borderStyle:
                    'solid',
                  borderColor:
                    (settings as any).photoBorderColor ??
                    '#fcd34d'
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
            ) : null}

            {/* =================================
                QR CODE DEPAN
                SEKARANG MENGIKUTI qrX,
                qrY DAN qrSize
            ================================== */}

            {settings.showQrCode ? (
              <div
                className="absolute"
                style={{
                  left: `${(settings as any).qrX ?? 78}%`,
                  top: `${(settings as any).qrY ?? 30}%`
                }}
              >
                <KtaQrCode
                  member={member}
                  size={Math.max(
                    36,
                    Math.round(
                      Math.min(
                        widthPx,
                        heightPx
                      ) *
                        ((settings as any)
                          .qrSize ??
                          22) /
                        100
                    )
                  )}
                  showLabel={false}
                  interactive={false}
                />
              </div>
            ) : null}

            {/* BARCODE DEPAN */}

            {(settings as any)
              .showBarcodeFront !==
            false ? (
              <div
                className="absolute flex flex-col items-center gap-1"
                style={{
                  left: `${(settings as any).barcodeFrontX ?? 4}%`,
                  top: `${(settings as any).barcodeFrontY ?? 77}%`,
                  width: `${(settings as any).barcodeFrontWidth ?? 32}%`,
                  height: `${(settings as any).barcodeFrontHeight ?? 9}%`
                }}
              >
                <div className="bg-white rounded p-1 w-full h-full flex items-center justify-center overflow-hidden">
                  <Barcode
                    value={
                      (settings as any)
                        .barcodeFrontCustomValue
                        ?.trim() ||
                      getMemberVerificationUrl(
                        member
                      )
                    }
                    width={Math.max(
                      20,
                      Math.round(
                        widthPx *
                          ((settings as any)
                            .barcodeFrontWidth ??
                            32) /
                          100
                      ) - 8
                    )}
                    height={Math.max(
                      8,
                      Math.round(
                        heightPx *
                          ((settings as any)
                            .barcodeFrontHeight ??
                            9) /
                          100
                      ) - 8
                    )}
                    barColor="#000"
                    showText={
                      (settings as any)
                        .barcodeFrontShowText ===
                      true
                    }
                  />
                </div>

                {(settings as any)
                  .barcodeFrontCaption ? (
                  <div
                    className="flex items-center gap-1"
                    style={{
                      fontSize: `${(settings as any).barcodeFrontCaptionFontSize ?? 6}px`,
                      fontWeight: weight(
                        (settings as any).barcodeFrontCaptionFontWeight ??
                          'normal'
                      ),
                      color:
                        (settings as any)
                          .barcodeFrontCaptionColor ??
                        '#ffffff',
                      textAlign:
                        (settings as any)
                          .barcodeFrontCaptionAlign ??
                        'center',
                      lineHeight:
                        Number(
                          (settings as any)
                            .barcodeFrontCaptionLineHeight ??
                            1.1
                        ),
                      letterSpacing: `${(settings as any).barcodeFrontCaptionLetterSpacing ?? 0}px`,
                      width: `${(settings as any).barcodeFrontCaptionWidth ?? 100}%`
                    }}
                  >
                    <ShieldCheck className="w-2.5 h-2.5" />

                    {
                      (settings as any)
                        .barcodeFrontCaption
                    }
                  </div>
                ) : null}
              </div>
            ) : null}

            {frontFields.map(
              renderField
            )}

            {frontTexts.map(
              renderText
            )}

            <div
              className="absolute overflow-hidden"
              style={{
                left: `${(settings as any).frontValidityTextX ?? 4}%`,
                top: `${(settings as any).frontValidityTextY ?? 92}%`,
                width: `${(settings as any).frontValidityTextWidth ?? 92}%`,
                fontSize: `${(settings as any).frontValidityTextFontSize ?? 7}px`,
                fontWeight: weight(
                  (settings as any).frontValidityTextFontWeight ??
                    'normal'
                ),
                color:
                  (settings as any).frontValidityTextColor ??
                  '#ffffff',
                textAlign:
                  (settings as any).frontValidityTextAlign ??
                  'left',
                lineHeight:
                  Number(
                    (settings as any).frontValidityTextLineHeight ??
                      1.2
                  ),
                letterSpacing: `${(settings as any).frontValidityTextLetterSpacing ?? 0}px`,
                whiteSpace:
                  'normal'
              }}
            >
              {
                settings.frontValidityText
              }
            </div>

            {settings.showKridaBadge &&
            member.krida ? (
              <div className="absolute right-[4%] bottom-[5%] px-2 py-1 rounded-full bg-amber-400 text-slate-950 text-[7px] font-black uppercase">
                {member.krida}
              </div>
            ) : null}
          </div>

          {/* ================================
              BELAKANG KARTU
          ================================= */}

          <div
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

            <div
              className="absolute overflow-hidden"
              style={{
                left: `${(settings as any).backHeaderTitleX ?? 5}%`,
                top: `${(settings as any).backHeaderTitleY ?? 6}%`,
                width: `${(settings as any).backHeaderTitleWidth ?? 90}%`,
                fontSize: `${(settings as any).backHeaderTitleFontSize ?? 11}px`,
                fontWeight: weight(
                  (settings as any).backHeaderTitleFontWeight ??
                    'bold'
                ),
                color:
                  (settings as any).backHeaderTitleColor ??
                  '#ffffff',
                textAlign:
                  (settings as any).backHeaderTitleAlign ??
                  'left',
                lineHeight:
                  Number(
                    (settings as any).backHeaderTitleLineHeight ??
                      1.15
                  ),
                letterSpacing: `${(settings as any).backHeaderTitleLetterSpacing ?? 0}px`,
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
                left: `${(settings as any).backHeaderSubtitleX ?? 5}%`,
                top: `${(settings as any).backHeaderSubtitleY ?? 14}%`,
                width: `${(settings as any).backHeaderSubtitleWidth ?? 90}%`,
                fontSize: `${(settings as any).backHeaderSubtitleFontSize ?? 8}px`,
                fontWeight: weight(
                  (settings as any).backHeaderSubtitleFontWeight ??
                    'normal'
                ),
                color:
                  (settings as any).backHeaderSubtitleColor ??
                  '#e5e7eb',
                textAlign:
                  (settings as any).backHeaderSubtitleAlign ??
                  'left',
                lineHeight:
                  Number(
                    (settings as any).backHeaderSubtitleLineHeight ??
                      1.2
                  ),
                letterSpacing: `${(settings as any).backHeaderSubtitleLetterSpacing ?? 0}px`,
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

            <div
              className="absolute overflow-hidden"
              style={{
                left: `${(settings as any).termsX ?? 5}%`,
                top: `${(settings as any).termsY ?? 25}%`,
                width: `${(settings as any).termsWidth ?? 90}%`,
                fontSize: `${(settings as any).termsFontSize ?? 7}px`,
                fontWeight: weight(
                  (settings as any).termsFontWeight ??
                    'normal'
                ),
                color:
                  (settings as any).termsColor ??
                  '#ffffff',
                textAlign:
                  (settings as any).termsAlign ??
                  'left',
                lineHeight:
                  Number(
                    (settings as any).termsLineHeight ??
                      1.35
                  ),
                letterSpacing: `${(settings as any).termsLetterSpacing ?? 0}px`,
                whiteSpace:
                  'normal',
                wordBreak:
                  'break-word'
              }}
            >
              {terms.map(
                (term, index) => (
                  <div
                    key={index}
                    className="mb-1"
                  >
                    {index + 1}.{' '}
                    {term}
                  </div>
                )
              )}
            </div>

            {backFields.map(
              renderField
            )}

            {backTexts.map(
              renderText
            )}

            <div
              className="absolute overflow-hidden"
              style={{
                left: `${(settings as any).signerX ?? 5}%`,
                top: `${(settings as any).signerY ?? 78}%`,
                width: `${(settings as any).signerWidth ?? 55}%`,
                color:
                  (settings as any).signerColor ??
                  '#ffffff',
                textAlign:
                  (settings as any).signerAlign ??
                  'left',
                lineHeight:
                  Number(
                    (settings as any).signerLineHeight ??
                      1.2
                  ),
                letterSpacing: `${(settings as any).signerLetterSpacing ?? 0}px`,
                whiteSpace:
                  'normal',
                wordBreak:
                  'break-word'
              }}
            >
              <div
                style={{
                  fontSize: `${(settings as any).issueLocationDateFontSize ?? 7}px`
                }}
              >
                {
                  settings.issueLocationDate
                }
              </div>

              <div
                style={{
                  fontSize: `${(settings as any).signerNameFontSize ?? 9}px`,
                  fontWeight: 700
                }}
              >
                {
                  settings.signerName
                }
              </div>

              <div
                style={{
                  fontSize: `${(settings as any).signerTitleFontSize ?? 7}px`
                }}
              >
                {
                  settings.signerTitle
                }
              </div>

              <div
                style={{
                  fontSize: `${(settings as any).signerSubtitleFontSize ?? 6}px`
                }}
              >
                {
                  settings.signerSubtitle
                }
              </div>
            </div>

            {settings.showBarcode !==
            false ? (
              <div
                className="absolute flex flex-col items-center gap-1"
                style={{
                  left: `${(settings as any).barcodeX ?? 68}%`,
                  top: `${(settings as any).barcodeY ?? 70}%`,
                  width: `${(settings as any).barcodeWidth ?? 27}%`
                }}
              >
                <div className="bg-white rounded p-1 w-full">
                  <Barcode
                    value={
                      settings.barcodeCustomValue?.trim() ||
                      getMemberVerificationUrl(
                        member
                      )
                    }
                    width={Math.max(
                      40,
                      Math.round(
                        widthPx * 0.22
                      )
                    )}
                    height={Math.max(
                      12,
                      Math.round(
                        heightPx * 0.08
                      )
                    )}
                    barColor="#000"
                    showText={
                      settings.barcodeShowText ===
                      true
                    }
                  />
                </div>

                <div className="text-[6px] flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5" />

                  {
                    (settings as any)
                      .barcodeCaption ||
                    'VERIFIKASI'
                  }
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {showControls ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setFlipped(
                (value) => !value
              )
            }
            className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-semibold"
          >
            <RotateCw className="inline w-3.5 h-3.5 mr-1" />

            Lihat{' '}
            {flipped
              ? 'Depan'
              : 'Belakang'}
          </button>

          {onPrintPdf ? (
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
          ) : null}

          {allowAdminEdit &&
          onEditCard ? (
            <button
              type="button"
              onClick={onEditCard}
              className="px-3 py-1.5 bg-purple-800 text-white rounded-xl text-xs font-semibold"
            >
              <Sliders className="inline w-3.5 h-3.5 mr-1" />

              Atur Desain
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default DigitalMemberCard;
