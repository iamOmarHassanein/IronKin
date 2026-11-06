# Tech packs

## Basic (2 pages), in `basic/`

Start here for first samples. Page 1 is the design: style details, front and back flats with numbered notes, and logo placement. Page 2 is how to make it: measurements, materials, construction, labels and packaging, sample comments and sign-off.

| File | Piece |
|---|---|
| `basic/IK-001-HD-BLK_signature-hoodie_basic.pdf` | Signature Hoodie, black |
| `basic/IK-001-WP-BLK_wide-leg-pants_basic.pdf` | Wide-Leg Pants, black |
| `basic/IK-001-WT-RSE_womens-fitted-tee_basic.pdf` | Women's Fitted Tee, washed rose |
| `basic/IK-001-WF-RSE_womens-flared-leggings_basic.pdf` | Women's Flared Leggings, washed rose |
| `basic/IK-TECH-PACK_basic-blank.pdf` | Blank 2-page master |

## Full (7 pages)

For factories that ask for more detail. One fillable PDF per Collection 001 piece, plus a blank master for new products. Each pack has 7 pages:

1. Cover: style number, name, collection, season, colourway, fit, size range, fabric, version, factory, status
2. Flats and design details: front and back with numbered callouts and notes
3. Artwork and placement: what goes where, method, colour, size, position, and the logo files
4. Measurement specification: points of measure, tolerances and a column per size
5. Bill of materials: every component, supplier, colour, placement and consumption
6. Construction: seam and stitch per area, thread, SPI, and detail photos
7. Labels, packaging and sample approvals log

| File | Piece |
|---|---|
| `IK-001-HD-BLK_signature-hoodie.pdf` | Signature Hoodie, black |
| `IK-001-WP-BLK_wide-leg-pants.pdf` | Wide-Leg Pants, black |
| `IK-001-WT-RSE_womens-fitted-tee.pdf` | Women's Fitted Tee, washed rose |
| `IK-001-WF-RSE_womens-flared-leggings.pdf` | Women's Flared Leggings, washed rose |
| `IK-TECH-PACK_blank-template.pdf` | Blank master for new products |

Anything marked TBC is a proposal or an open question. Size values are blank until the factory supplies a graded spec.

## Edit in Adobe Acrobat

- **Numbers and text:** every value is a form field. Click and type. This works in Acrobat and the free Acrobat Reader. Save, then send the PDF to the factory.
- **Pictures:** Acrobat Pro: Edit PDF, right-click an image, Replace Image.
- **Lock before sending (optional):** Print to PDF, or use Prepare Form, then flatten, so the factory cannot change values.

## Edit in Adobe Illustrator

Open the PDF in Illustrator (File, Open, choose the page). Text, lines, tables and colours become editable artwork and images stay placed, so you can redraw flats, move callouts or change the layout. Form fields do not stay fillable in Illustrator; save the result as a PDF.

## Regenerate

The packs are built from the data at the top of `tools/build_techpacks.py`. Change values there and run:

```bash
python 02-product/tech-packs/tools/build_techpacks.py
```

That rewrites all the PDFs, basic and full, so do this before hand edits, not after. Flats come from `03-website/source-boards/cutouts/`, made by `03-website/tools/make_assets.py`.

Fonts: Barlow and Barlow Condensed, SIL Open Font License (`tools/fonts/OFL.txt`).
