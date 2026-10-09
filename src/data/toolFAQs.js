export const toolFAQs = {
  '/compress': [
    { q: 'How much can I compress a PDF?', a: 'It depends on the content. Scanned and image-heavy PDFs often shrink a lot; text-heavy PDFs may shrink little or not at all. If the result would not be smaller, you get your original file back.' },
    { q: 'Will compression affect PDF quality?', a: 'Yes. Each page is converted to an image, so text can no longer be selected or searched. Use High Quality for documents you will read or print, Medium for email, and Low for maximum size reduction.' },
    { q: 'Is there a file size limit?', a: 'We do not set one. Files are processed in your browser, so very large PDFs depend on your device memory and can be slow or fail on phones.' },
    { q: 'Is my PDF safe during compression?', a: 'Yes. All processing happens in your browser. Your file never leaves your device or gets uploaded to any server.' },
    { q: 'How long does compression take?', a: 'Most PDFs compress in 5–30 seconds depending on file size and your device speed.' },
  ],
  '/merge': [
    { q: 'How many PDFs can I merge at once?', a: 'Unlimited. There is no cap on the number of files you can combine. Merge 2 or 200 PDFs in one go.' },
    { q: 'Will merging reduce quality?', a: 'No. Merging is completely lossless. Every page is preserved at original quality.' },
    { q: 'Can I merge password-protected PDFs?', a: 'You need to unlock them first using our Unlock PDF tool, then merge them.' },
    { q: 'Is there a file size limit for merging?', a: 'No limits at all. Merge large PDFs of any size completely free.' },
  ],
  '/split': [
    { q: 'Can I split specific pages only?', a: 'Yes. Use Split to get individual pages, or use Extract Pages tool to get specific pages in one file.' },
    { q: 'Will splitting affect page quality?', a: 'No. Each split page is extracted without any quality loss or compression.' },
    { q: 'How many pages can I split?', a: 'Unlimited pages. No restrictions on PDF length.' },
  ],
  '/pdf-to-jpg': [
    { q: 'What resolution are the converted JPG images?', a: 'We render at 2x scale (200% resolution) giving high-quality, sharp images suitable for printing and editing.' },
    { q: 'Can I convert all pages at once?', a: 'Yes. All pages are automatically converted. Download each page individually.' },
    { q: 'Does it work with scanned PDFs?', a: 'Yes. Scanned PDFs convert perfectly since they are already image-based.' },
  ],
  '/pdf-to-text': [
    { q: 'Does it work with scanned PDFs?', a: 'Scanned PDFs are image-based, so text extraction may not work. It works best with digital/typed PDFs.' },
    { q: 'What format is the extracted text?', a: 'Plain text (.txt) file that you can open in any text editor or Word.' },
    { q: 'Is there a page limit?', a: 'No. Extract text from PDFs with any number of pages.' },
  ],
  '/unlock': [
    { q: 'Can you crack PDFs without a password?', a: 'No. We can only remove protection if you provide the correct password. We cannot break encryption.' },
    { q: 'Is it legal to unlock PDFs?', a: 'Yes, if you own the document or have permission. Unlocking without authorization may be illegal.' },
    { q: 'What if the password is wrong?', a: 'You will see an error and no file is created. Check the password and try again.' },
    { q: 'Does my password leave my device?', a: 'No. The PDF is decrypted in your browser. Neither the file nor the password is sent to any server.' },
  ],
  '/watermark': [
    { q: 'Can I customize the watermark position?', a: 'The watermark is placed diagonally across the center of each page for maximum visibility.' },
    { q: 'Can I add a logo or image watermark?', a: 'Currently only text watermarks are supported. Image watermarks are coming soon.' },
    { q: 'Can I control how transparent the watermark is?', a: 'Yes. Use the opacity slider to set transparency from 10% (very faint) to 100% (solid).' },
  ],
  '/page-numbers': [
    { q: 'Can I choose where page numbers appear?', a: 'Yes. Choose from Bottom Center, Bottom Right, Top Center, or Top Right.' },
    { q: 'Can I start numbering from a custom number?', a: 'Yes. Set any starting number — useful when this PDF is part of a larger document.' },
    { q: 'Will existing content be covered by page numbers?', a: 'Page numbers are added in the margin area to avoid covering existing content.' },
  ],
  '/bank-converter': [
    { q: 'Which banks are supported?', a: 'All major Indian banks — SBI, HDFC, ICICI, Axis, Kotak, PNB, Bank of Baroda, Canara, Union Bank, Yes Bank, IndusInd, IDFC and more. Auto-detection works for most banks.' },
    { q: 'Why are some transactions missing?', a: 'This tool works best with text-based PDFs. Scanned or image-based statements may not extract all transactions. Download your statement as PDF directly from net banking.' },
    { q: 'Is my bank data safe?', a: '100% safe. All processing happens in your browser. Your financial data never gets uploaded to any server.' },
    { q: 'Can I filter transactions by date?', a: 'Yes. Use the date range filter to view transactions from specific periods.' },
    { q: 'What formats can I download?', a: 'CSV (opens in Excel, Google Sheets) and Excel (.xlsx) both available.' },
  ],
  '/rotate': [
    { q: 'Does rotation affect file quality?', a: 'No. Rotation is completely lossless — no quality change at all.' },
    { q: 'Can I rotate specific pages only?', a: 'Currently all pages rotate together. Extract specific pages first, then rotate.' },
  ],
  '/grayscale': [
    { q: 'How much does grayscale reduce file size?', a: 'Typically 20–30% reduction as color data is removed from images.' },
    { q: 'Can I convert back to color after grayscale?', a: 'No. Grayscale conversion is permanent. Keep your original colored file as backup.' },
  ],
  '/extract-pages': [
    { q: 'Can I extract non-consecutive pages?', a: 'Yes. Enter pages like 1,3,5,8 to extract any combination of pages.' },
    { q: 'Can I extract pages in a custom order?', a: 'Yes. Enter 3,1,2 to extract page 3 first, then 1, then 2.' },
  ],
  '/delete-pages': [
    { q: 'Can I undo page deletion?', a: 'No. Always keep your original file as a backup before deleting pages.' },
    { q: 'Can I delete multiple pages at once?', a: 'Yes. Enter 1,3,5 to delete multiple pages in one step.' },
  ],
  '/reorder-pages': [
    { q: 'How do I specify the new order?', a: 'Enter the new page numbers in desired order. For example: "3,1,2" puts page 3 first, then page 1, then page 2.' },
    { q: 'Can I duplicate pages while reordering?', a: 'Yes. Enter "1,1,2,3" to include page 1 twice.' },
  ],
  '/jpg-to-pdf': [
    { q: 'How many JPG images can I convert?', a: 'Unlimited. Convert as many images as needed into a single PDF.' },
    { q: 'Will image quality be preserved?', a: 'Yes. Images are embedded at full original quality in the PDF.' },
  ],
  '/png-to-pdf': [
    { q: 'Does PNG to PDF support transparency?', a: 'PNG transparency is preserved during conversion.' },
    { q: 'Is there a limit on image count?', a: 'No. Convert unlimited PNG images to PDF.' },
  ],
  '/images-to-pdf': [
    { q: 'Can I mix JPG and PNG images?', a: 'Yes. Combine any mix of JPG and PNG images into one PDF.' },
    { q: 'How is the page order determined?', a: 'Pages appear in the order you select or upload the images.' },
  ],
}

export const defaultFAQs = [
  { q: 'Are all PDF Master Pro tools completely free?', a: 'Yes, all 32 tools are 100% free forever. No hidden charges, no premium version, no login required.' },
  { q: 'Is there a file size limit?', a: 'No. We have zero file size restrictions. Process any PDF of any size, as many times as you want.' },
  { q: 'Are my files secure and private?', a: 'Absolutely. All processing happens locally in your browser. Your files never get uploaded to any server. 100% private.' },
  { q: 'Do I need to create an account?', a: 'Never. No account, no email, no registration. Just open the tool and start using it instantly.' },
  { q: 'Does it work on mobile?', a: 'Yes. PDF Master Pro works on all devices — desktop, tablet, and mobile — in any modern browser.' },
]
