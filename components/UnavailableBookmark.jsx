import { IconButton, Tooltip } from '@mui/material';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';

export default function UnavailableBookmark() {
    return (
        <Tooltip title="Log in to save bookmarks">
            <span> {/* Wrapping the disabled IconButton with a span */}
                <IconButton
                    disabled
                    sx={{ color: 'grey', fontSize: '2rem', pointerEvents: 'none' }}
                >
                    <BookmarkBorderIcon sx={{ fontSize: '2rem' }} />
                </IconButton>
            </span>
        </Tooltip>
    );
}