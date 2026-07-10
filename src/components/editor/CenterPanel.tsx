import { useProjectStore } from '@/store/useProjectStore';
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
import { GOOGLE_FONT_OPTIONS, LogoPlacement } from '@/types/infographic';

export function CenterPanel() {
  const center = useProjectStore((state) => state.center);
  const setCenter = useProjectStore((state) => state.setCenter);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="center-title">Title</Label>
        <Input
          id="center-title"
          value={center.title}
          onChange={(e) => setCenter({ title: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="center-subtitle">Subtitle</Label>
        <Input
          id="center-subtitle"
          value={center.subtitle}
          onChange={(e) => setCenter({ subtitle: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="center-caption">Footer Caption</Label>
        <Input
          id="center-caption"
          value={center.footerCaption}
          onChange={(e) => setCenter({ footerCaption: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="title-font">Title Font</Label>
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
          <Label htmlFor="subtitle-font">Subtitle Font</Label>
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
        <Label htmlFor="caption-font">Caption Font</Label>
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
          <Label htmlFor="title-color">Title Color</Label>
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
          <Label htmlFor="subtitle-color">Subtitle Color</Label>
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

      <div className="space-y-2">
        <Label htmlFor="caption-color">Caption Color</Label>
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
        <Label htmlFor="logo-placement">Logo Placement</Label>
        <Select
          value={center.logoPlacement}
          onValueChange={(v) => setCenter({ logoPlacement: v as LogoPlacement })}
        >
          <SelectTrigger id="logo-placement">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Automatic</SelectItem>
            <SelectItem value="top">Top</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="bottom">Bottom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <LogoUploader />
    </div>
  );
}

function LogoUploader() {
  const logos = useProjectStore((state) => state.center.logos);
  const addLogo = useProjectStore((state) => state.addLogo);
  const removeLogo = useProjectStore((state) => state.removeLogo);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (!['image/svg+xml', 'image/png'].includes(file.type)) continue;
      const dataUrl = await readFileAsDataURL(file);
      addLogo({
        id: Math.random().toString(36).slice(2),
        name: file.name,
        dataUrl,
        type: file.type as 'image/svg+xml' | 'image/png',
      });
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="logo-upload">Logos ({logos.length}/3)</Label>
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
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
