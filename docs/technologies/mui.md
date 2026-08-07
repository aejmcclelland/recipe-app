# Material UI

## Version

- Use Material UI v7.
- Follow the official MUI documentation.

## Layout

- Prefer Stack for vertical layouts.
- Prefer Box for simple containers.
- Avoid unnecessary nested Box components.
- Use Container for page-level layouts.

## Forms

- Use TextField for text input.
- Use Select inside FormControl.
- Associate every Select with an InputLabel.
- Prefer controlled components where practical.

## Buttons

- Use Button rather than native button elements.
- Prefer variant="contained" for primary actions.
- Use fullWidth on mobile-friendly forms.
- Use startIcon/endIcon rather than manually positioning icons.

## Styling

- Prefer the sx prop over inline style objects.
- Reuse existing colour palette.
- Avoid hard-coded spacing values when MUI spacing is suitable.
- Keep styling close to the component unless reused.

## Images

- Continue using next/image.
- Use MUI layout components around Image rather than replacing Image.

## Responsive design

Prefer responsive sx values.

Example:

sx={{
    width: {
        xs: '100%',
        md: 'auto',
    }
}}

rather than media queries.

## Project conventions

Forms should generally follow this order:

1. Section heading
2. Description
3. Input controls
4. Validation
5. Primary action

Buttons should use:

height: 40
fontWeight: 600

Image upload buttons should match existing styling across the application.

Use Stack rather than Box when arranging vertical form sections.

## Accessibility

- Provide labels for form controls.
- Use Typography rather than raw h1–h6 tags where appropriate.
- Use Button instead of clickable divs.