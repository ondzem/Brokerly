-- Makléř nahrává k nemovitosti víc než PDF: výpis z katastru bývá sken,
-- nabídka přijde v Excelu, poznámky v textu. Původní seznam typů tyhle
-- soubory odmítal s nesrozumitelnou chybou z úložiště.
update storage.buckets
set allowed_mime_types = array[
        'application/pdf',
        'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/tiff',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain', 'text/csv',
        'application/zip'
    ],
    file_size_limit = 20971520
where id = 'property-documents';
