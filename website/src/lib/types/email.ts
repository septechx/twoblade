export type EmailStatus =
    | 'pending'
    | 'sending'
    | 'sent'
    | 'failed'
    | 'rejected'
    | 'scheduled'
export type EmailContentType = 'text/plain' | 'text/html'
export type EmailClassification =
    | 'primary'
    | 'promotions'
    | 'social'
    | 'forums'
    | 'updates'
export interface EmailAttachment {
    key: string
    filename: string
    size: number
    type: string
}
export interface Email {
    id: string
    from_address: string
    from_domain: string
    to_address: string
    to_domain: string
    subject: string | null
    body: string | null
    sent_at: string
    error_message: string | null
    status: EmailStatus
    starred: boolean
    content_type: EmailContentType
    html_body: string | null
    read_at: string | null
    classification: EmailClassification
    reply_to_id?: string | null
    thread_id?: string | null
    attachments: EmailAttachment[]
    expires_at: string | null
    self_destruct: boolean
}
export interface Draft {
    id: number
    user_email: string
    to_address: string | null
    subject: string | null
    body: string | null
    content_type: EmailContentType
    html_body: string | null
    created_at: string
    updated_at: string
}
export type AllowedTag =
    | 'p'
    | 'br'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'ul'
    | 'ol'
    | 'li'
    | 'strong'
    | 'em'
    | 'u'
    | 'a'
    | 'img'
    | 'table'
    | 'thead'
    | 'tbody'
    | 'tfoot'
    | 'tr'
    | 'th'
    | 'td'
    | 'caption'
    | 'colgroup'
    | 'col'
    | 'div'
    | 'span'
    | 'body'
    | 'header'
    | 'footer'
    | 'section'
    | 'article'
    | 'nav'
    | 'main'
    | 'aside'
    | 'figure'
    | 'figcaption'
    | 'blockquote'
    | 'pre'
    | 'code'
    | 'small'
    | 'cite'
    | 'sup'
    | 'sub'
    | 'time'
    | 'video'
    | 'audio'
    | 'source'
export const ALLOWED_HTML_TAGS: AllowedTag[] = [
    'p',
    'br',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'strong',
    'em',
    'u',
    'a',
    'img',
    'table',
    'thead',
    'tbody',
    'tfoot',
    'tr',
    'th',
    'td',
    'caption',
    'colgroup',
    'col',
    'div',
    'span',
    'body',
    'header',
    'footer',
    'section',
    'article',
    'nav',
    'main',
    'aside',
    'figure',
    'figcaption',
    'blockquote',
    'pre',
    'code',
    'small',
    'cite',
    'sup',
    'sub',
    'time',
    'video',
    'audio',
    'source'
]
export type AttributeMap = {
    [K in AllowedTag | '*']?: readonly string[]
}
export const ALLOWED_HTML_ATTRIBUTES: AttributeMap = {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    video: ['src', 'controls', 'width', 'height', 'poster'],
    audio: ['src', 'controls'],
    source: ['src', 'type'],
    table: ['border', 'cellspacing', 'cellpadding', 'summary', 'width'],
    th: ['colspan', 'rowspan', 'scope'],
    td: ['colspan', 'rowspan'],
    colgroup: ['span'],
    col: ['span', 'width'],
    blockquote: ['cite'],
    time: ['datetime'],
    '*': ['style', 'title']
}
export type AllowedCSSProperty =
    | 'color'
    | 'background'
    | 'background-color'
    | 'background-image'
    | 'background-repeat'
    | 'background-position'
    | 'background-size'
    | 'font-size'
    | 'font-weight'
    | 'font-style'
    | 'font-family'
    | 'text-align'
    | 'text-decoration'
    | 'line-height'
    | 'letter-spacing'
    | 'margin'
    | 'margin-top'
    | 'margin-right'
    | 'margin-bottom'
    | 'margin-left'
    | 'padding'
    | 'padding-top'
    | 'padding-right'
    | 'padding-bottom'
    | 'padding-left'
    | 'border'
    | 'border-width'
    | 'border-style'
    | 'border-color'
    | 'border-top'
    | 'border-right'
    | 'border-bottom'
    | 'border-left'
    | 'border-radius'
    | 'width'
    | 'max-width'
    | 'min-width'
    | 'height'
    | 'max-height'
    | 'min-height'
    | 'display'
    | 'flex'
    | 'flex-direction'
    | 'flex-wrap'
    | 'justify-content'
    | 'align-items'
    | 'gap'
    | 'column-gap'
    | 'row-gap'
    | 'opacity'
    | 'visibility'
    | 'position'
    | 'top'
    | 'right'
    | 'bottom'
    | 'left'
    | 'z-index'
    | 'box-shadow'
    | 'overflow'
    | 'text-overflow'
    | 'white-space'
    | 'vertical-align'
    | 'float'
    | 'clear'
    | 'list-style-type'
    | 'list-style-position'
    | 'list-style-image'
export const ALLOWED_CSS_PROPERTIES: AllowedCSSProperty[] = [
    'color',
    'background',
    'background-color',
    'background-image',
    'background-repeat',
    'background-position',
    'background-size',
    'font-size',
    'font-weight',
    'font-style',
    'font-family',
    'text-align',
    'text-decoration',
    'line-height',
    'letter-spacing',
    'margin',
    'margin-top',
    'margin-right',
    'margin-bottom',
    'margin-left',
    'padding',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'border',
    'border-width',
    'border-style',
    'border-color',
    'border-top',
    'border-right',
    'border-bottom',
    'border-left',
    'border-radius',
    'width',
    'max-width',
    'min-width',
    'height',
    'max-height',
    'min-height',
    'display',
    'flex',
    'flex-direction',
    'flex-wrap',
    'justify-content',
    'align-items',
    'gap',
    'column-gap',
    'row-gap',
    'opacity',
    'visibility',
    'position',
    'top',
    'right',
    'bottom',
    'left',
    'z-index',
    'box-shadow',
    'overflow',
    'text-overflow',
    'white-space',
    'vertical-align',
    'float',
    'clear',
    'list-style-type',
    'list-style-position',
    'list-style-image'
]
