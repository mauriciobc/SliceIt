import { useProjectStore } from '@/store/useProjectStore';
import { createUploadedImage, validateImageFile } from '@/lib/fileUpload';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { GOOGLE_FONT_OPTIONS, LogoPlacement } from '@/types/infographic';
import { useI18n } from '@/i18n';

export function CenterPanel() {
  const { t } = useI18n();
  const center = useProjectStore((state) => state.center);
  const setCenter = useProjectStore((state) => state.setCenter);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="center-title">{t('center.title')}</Label>
        <Input
          id="center-title"
          value={center.title}
          onChange={(e) => setCenter({ title: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="center-subtitle">{t('center.subtitle')}</Label>
        <Input
          id="center-subtitle"
          value={center.subtitle}
          onChange={(e) => setCenter({ subtitle: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="center-caption">{t('center.footerCaption')}</Label>
        <Input
          id="center-caption"
          value={center.footerCaption}
          onChange={(e) => setCenter({ footerCaption: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="title-font">{t('center.titleFont')}</Label>
          <Select value={center.titleFont} onValueChange={(v) => setCenter({ titleFont: v })}>
            <SelectTrigger id="title-font">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GOOGLE_FONT_OPTIONS.map((font) => (
                <SelectItem key={font} value={font}>
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="subtitle-font">{t('center.subtitleFont')}</Label>
          <Select value={center.subtitleFont} onValueChange={(v) => setCenter({ subtitleFont: v })}>
            <SelectTrigger id="subtitle-font">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GOOGLE_FONT_OPTIONS.map((font) => (
                <SelectItem key={font} value={font}>
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="caption-font">{t('center.captionFont')}</Label>
        <Select value={center.captionFont} onValueChange={(v) => setCenter({ captionFont: v })}>
          <SelectTrigger id="caption-font">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GOOGLE_FONT_OPTIONS.map((font) => (
              <SelectItem key={font} value={font}>
                {font}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="title-color">{t('center.titleColor')}</Label>
          <div className="flex items-center gap-2">
            <Input
              id="title-color"
              type="color"
              value={center.titleColor}
              onChange={(e) => setCenter({ titleColor: e.target.value })}
              className="h-9 w-14 px-1 py-1"
            />
            <Input
              type="text"
              value={center.titleColor}
              onChange={(e) => setCenter({ titleColor: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="subtitle-color">{t('center.subtitleColor')}</Label>
          <div className="flex items-center gap-2">
            <Input
              id="subtitle-color"
              type="color"
              value={center.subtitleColor}
              onChange={(e) => setCenter({ subtitleColor: e.target.value })}
              className="h-9 w-14 px-1 py-1"
            />
            <Input
              type="text"
              value={center.subtitleColor}
              onChange={(e) => setCenter({ subtitleColor: e.target.value })}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="center-color-auto">{t('center.autoCenterColor')}</Label>
          <Switch
            id="center-color-auto"
            checked={center.centerColorOverride === undefined}
            onCheckedChange={(checked) =>
              setCenter({ centerColorOverride: checked ? undefined : '#e5e7eb' })
            }
          />
        </div>
        {center.centerColorOverride !== undefined && (
          <div className="space-y-2">
            <Label htmlFor="center-color">{t('center.centerColor')}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="center-color"
                type="color"
                value={center.centerColorOverride}
                onChange={(e) => setCenter({ centerColorOverride: e.target.value })}
                className="h-9 w-14 px-1 py-1"
              />
              <Input
                type="text"
                value={center.centerColorOverride}
                onChange={(e) => setCenter({ centerColorOverride: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="caption-color">{t('center.captionColor')}</Label>
        <div className="flex items-center gap-2">
          <Input
            id="caption-color"
            type="color"
            value={center.captionColor}
            onChange={(e) => setCenter({ captionColor: e.target.value })}
            className="h-9 w-14 px-1 py-1"
          />
          <Input
            type="text"
            value={center.captionColor}
            onChange={(e) => setCenter({ captionColor: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="logo-placement">{t('center.logoPlacement')}</Label>
        <Select
          value={center.logoPlacement}
          onValueChange={(v) => setCenter({ logoPlacement: v as LogoPlacement })}
        >
          <SelectTrigger id="logo-placement">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">{t('center.placement.auto')}</SelectItem>
            <SelectItem value="top">{t('center.placement.top')}</SelectItem>
            <SelectItem value="center">{t('center.placement.center')}</SelectItem>
            <SelectItem value="bottom">{t('center.placement.bottom')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <LogoUploader />
    </div>
  );
}

function LogoUploader() {
  const { t } = useI18n();
  const logos = useProjectStore((state) => state.center.logos);
  const addLogo = useProjectStore((state) => state.addLogo);
  const removeLogo = useProjectStore((state) => state.removeLogo);
  const reportError = useProjectStore((state) => state.reportError);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const check = validateImageFile(file);
      if (!check.ok) {
        reportError({ key: check.reason === 'size' ? 'upload.tooLarge' : 'upload.invalidType' });
        continue;
      }
      const image = await createUploadedImage(file);
      addLogo(image);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="logo-upload">{t('center.logos', { count: logos.length })}</Label>
      <Input
        id="logo-upload"
        type="file"
        accept=".svg,.png"
        multiple
        onChange={handleChange}
        disabled={logos.length >= 3}
      />
      <div className="flex flex-wrap gap-2">
        {logos.map((logo) => (
          <div key={logo.id} className="flex items-center gap-2 rounded border p-2">
            <img src={logo.dataUrl} alt="" className="h-8 w-8 object-contain" />
            <span className="max-w-[100px] truncate text-xs">{logo.name}</span>
            <button
              type="button"
              onClick={() => removeLogo(logo.id)}
              className="text-xs text-destructive hover:underline"
            >
              {t('center.remove')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
