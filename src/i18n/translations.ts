export type TranslationParams = Record<string, string | number>;

export type TranslationResource = Record<string, string>;

export const SUPPORTED_LOCALES = ['en', 'pt-BR'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_STORAGE_KEY = 'sliceit:locale';

export const translations: Record<Locale, TranslationResource> = {
  en: {
    'header.subtitle': 'Radial Infographic Generator',

    'language.label': 'Language',
    'language.en': 'English',
    'language.ptBR': 'Português (BR)',

    'tabs.slices': 'Slices',
    'tabs.canvas': 'Canvas',
    'tabs.palette': 'Palette',
    'tabs.center': 'Center',
    'tabs.typography': 'Type',

    'slices.count': '{{count}} slices',
    'slices.add': 'Add Slice',
    'slices.editSelected': 'Edit Selected Slice',
    'slices.emptyLabel': 'Slice {{index}}',
    'slices.ariaColor': 'Slice color',
    'slices.ariaRemove': 'Remove slice',
    'slices.metric': 'Metric',
    'slices.label': 'Label',
    'slices.color': 'Color',
    'slices.icon': 'Icon',
    'slices.uploadIcon': 'Upload SVG/PNG',
    'slices.clearUploaded': 'Clear uploaded',
    'slices.selectIcon': 'Select an icon',
    'slices.none': 'None',
    'slices.uploaded': 'Uploaded',
    'slices.searchIcon': 'Search icons\u2026',
    'slices.browseIcons': '{{count}} icons',
    'slices.noIcons': 'No icons found',
    'slices.moreIcons': 'Showing {{shown}} of {{total}} \u2014 refine your search',

    'typography.metricFont': 'Metric Font',
    'typography.labelFont': 'Label Font',
    'typography.showIcons': 'Show Icons',
    'typography.metricLabelGap': 'Metric\u2013Label Gap',
    'typography.iconSize': 'Icon Size',

    'center.title': 'Title',
    'center.subtitle': 'Subtitle',
    'center.footerCaption': 'Footer Caption',
    'center.titleFont': 'Title Font',
    'center.subtitleFont': 'Subtitle Font',
    'center.captionFont': 'Caption Font',
    'center.titleColor': 'Title Color',
    'center.subtitleColor': 'Subtitle Color',
    'center.captionColor': 'Caption Color',
    'center.autoCenterColor': 'Auto Center Color',
    'center.centerColor': 'Center Color',
    'center.logoPlacement': 'Logo Placement',
    'center.placement.auto': 'Automatic',
    'center.placement.top': 'Top',
    'center.placement.center': 'Center',
    'center.placement.bottom': 'Bottom',
    'center.logos': 'Logos ({{count}}/3)',
    'center.remove': 'Remove',

    'palette.mode': 'Palette Mode',
    'palette.single': 'Single Color',
    'palette.gradient': 'Start / End',
    'palette.manual': 'Manual',
    'palette.baseColor': 'Base Color',
    'palette.startColor': 'Start Color',
    'palette.endColor': 'End Color',
    'palette.manualHint':
      'Edit colors directly in the slice list on the Slices tab.',

    'canvas.aspectRatio': 'Aspect Ratio',
    'canvas.custom': 'Custom',
    'canvas.width': 'Width',
    'canvas.height': 'Height',
    'canvas.backgroundColor': 'Background Color',
    'canvas.segmentExtension': 'Segment Extension: {{value}}',
    'canvas.segmentExtensionHint':
      'How far segments extend beyond canvas (1.0 = to edge, 1.5 = 50% bleed)',
    'canvas.textPosition': 'Text Position: {{value}}',
    'canvas.textPositionHint':
      'Text position within segments (0.0 = inner, 1.0 = outer)',

    'import.dropActive': 'Drop file here',
    'import.dropInactive': 'Drag & drop CSV or JSON',
    'import.hint': 'metric, label, color',
    'import.chooseFile': 'Choose File',
    'import.orSelect': 'Or select a file',

    'issues.title': 'Issues ({{count}})',
    'textWarnings.metricOverflow':
      'Metric "{{metric}}" may overflow slice {{slice}}.',
    'textWarnings.labelOverflow':
      'Label "{{label}}" may overflow slice {{slice}}.',

    'statusBar.ready': 'Ready',

    'validation.maxSlices': 'Maximum {{max}} slices allowed.',
    'validation.recommendedSlices':
      'More than {{max}} slices may reduce readability.',
    'validation.minSlices': 'At least {{min}} slices are required.',

    'export.svg': 'SVG',
    'export.png': 'PNG',
    'export.pngResolution': 'PNG resolution',
    'export.resolution.1x': '1x (Current size)',
    'export.resolution.2x': '2x',
    'export.resolution.4x': '4x',
    'export.resolution.social': 'Social (1080px short edge)',
    'export.resolution.hd': 'HD (1920px short edge)',
    'export.resolution.4k': '4K (3840px short edge)',

    'actions.save': 'Save',
    'actions.load': 'Load',
  },

  'pt-BR': {
    'header.subtitle': 'Gerador de Infogr\u00E1fico Radial',

    'language.label': 'Idioma',
    'language.en': 'English',
    'language.ptBR': 'Portugu\u00EAs (BR)',

    'tabs.slices': 'Fatias',
    'tabs.canvas': 'Tela',
    'tabs.palette': 'Paleta',
    'tabs.center': 'Centro',
    'tabs.typography': 'Texto',

    'slices.count': '{{count}} fatias',
    'slices.add': 'Adicionar Fatia',
    'slices.editSelected': 'Editar Fatia Selecionada',
    'slices.emptyLabel': 'Fatia {{index}}',
    'slices.ariaColor': 'Cor da fatia',
    'slices.ariaRemove': 'Remover fatia',
    'slices.metric': 'M\u00E9trica',
    'slices.label': 'R\u00F3tulo',
    'slices.color': 'Cor',
    'slices.icon': '\u00CDcone',
    'slices.uploadIcon': 'Enviar SVG/PNG',
    'slices.clearUploaded': 'Limpar enviado',
    'slices.selectIcon': 'Selecionar um \u00EDcone',
    'slices.none': 'Nenhum',
    'slices.uploaded': 'Enviados',
    'slices.searchIcon': 'Buscar \u00EDcones\u2026',
    'slices.browseIcons': '{{count}} \u00EDcones',
    'slices.noIcons': 'Nenhum \u00EDcone encontrado',
    'slices.moreIcons': 'Exibindo {{shown}} de {{total}} \u2014 refine a busca',

    'typography.metricFont': 'Fonte da M\u00E9trica',
    'typography.labelFont': 'Fonte do R\u00F3tulo',
    'typography.showIcons': 'Mostrar \u00CDcones',
    'typography.metricLabelGap': 'Espa\u00E7o M\u00E9trica\u2013R\u00F3tulo',
    'typography.iconSize': 'Tamanho do \u00CDcone',

    'center.title': 'T\u00EDtulo',
    'center.subtitle': 'Subt\u00EDtulo',
    'center.footerCaption': 'Legenda do Rodap\u00E9',
    'center.titleFont': 'Fonte do T\u00EDtulo',
    'center.subtitleFont': 'Fonte do Subt\u00EDtulo',
    'center.captionFont': 'Fonte da Legenda',
    'center.titleColor': 'Cor do T\u00EDtulo',
    'center.subtitleColor': 'Cor do Subt\u00EDtulo',
    'center.captionColor': 'Cor da Legenda',
    'center.autoCenterColor': 'Cor do Centro Autom\u00E1tica',
    'center.centerColor': 'Cor do Centro',
    'center.logoPlacement': 'Posi\u00E7\u00E3o do Logotipo',
    'center.placement.auto': 'Autom\u00E1tica',
    'center.placement.top': 'Topo',
    'center.placement.center': 'Centro',
    'center.placement.bottom': 'Base',
    'center.logos': 'Logotipos ({{count}}/3)',
    'center.remove': 'Remover',

    'palette.mode': 'Modo da Paleta',
    'palette.single': 'Cor \u00DAnica',
    'palette.gradient': 'In\u00EDcio / Fim',
    'palette.manual': 'Manual',
    'palette.baseColor': 'Cor Base',
    'palette.startColor': 'Cor Inicial',
    'palette.endColor': 'Cor Final',
    'palette.manualHint':
      'Edite as cores diretamente na lista de fatias na aba Fatias.',

    'canvas.aspectRatio': 'Propor\u00E7\u00E3o',
    'canvas.custom': 'Personalizado',
    'canvas.width': 'Largura',
    'canvas.height': 'Altura',
    'canvas.backgroundColor': 'Cor de Fundo',
    'canvas.segmentExtension': 'Extens\u00E3o do Segmento: {{value}}',
    'canvas.segmentExtensionHint':
      'Qu\u00E3o longe os segmentos se estendem al\u00E9m da tela (1.0 = at\u00E9 a borda, 1.5 = 50% de sangria)',
    'canvas.textPosition': 'Posi\u00E7\u00E3o do Texto: {{value}}',
    'canvas.textPositionHint':
      'Posi\u00E7\u00E3o do texto dentro dos segmentos (0.0 = interno, 1.0 = externo)',

    'import.dropActive': 'Solte o arquivo aqui',
    'import.dropInactive': 'Arraste e solte CSV ou JSON',
    'import.hint': 'm\u00E9trica, r\u00F3tulo, cor',
    'import.chooseFile': 'Escolher Arquivo',
    'import.orSelect': 'Ou selecione um arquivo',

    'issues.title': 'Problemas ({{count}})',
    'textWarnings.metricOverflow':
      'A m\u00E9trica "{{metric}}" pode transbordar a fatia {{slice}}.',
    'textWarnings.labelOverflow':
      'O r\u00F3tulo "{{label}}" pode transbordar a fatia {{slice}}.',

    'statusBar.ready': 'Pronto',

    'validation.maxSlices': 'M\u00E1ximo de {{max}} fatias permitido.',
    'validation.recommendedSlices':
      'Mais de {{max}} fatias podem reduzir a legibilidade.',
    'validation.minSlices': 'Pelo menos {{min}} fatias s\u00E3o necess\u00E1rias.',

    'export.svg': 'SVG',
    'export.png': 'PNG',
    'export.pngResolution': 'Resolu\u00E7\u00E3o do PNG',
    'export.resolution.1x': '1x (tamanho atual)',
    'export.resolution.2x': '2x',
    'export.resolution.4x': '4x',
    'export.resolution.social': 'Social (1080px no lado menor)',
    'export.resolution.hd': 'HD (1920px no lado menor)',
    'export.resolution.4k': '4K (3840px no lado menor)',

    'actions.save': 'Salvar',
    'actions.load': 'Carregar',
  },
};
