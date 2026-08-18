import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Paper, CircularProgress, InputAdornment, Pagination } from '@mui/material';
import { Search as SearchIcon, Users } from 'lucide-react';
import { userService } from '../../services/userService';
import type { FollowUser } from '../../types/follow';
import { UserListItem } from '../../components/common/UserListItem';
import { useDebounce } from '../../hooks';

const LIMIT = 5;

export const SearchView: React.FC = () => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setPage(1);
    handleSearch(debouncedQuery, 1);
  }, [debouncedQuery]);

  const handleSearch = async (searchTerm: string, pageNum: number) => {
    setLoading(true);
    try {
      const res = await userService.searchUsers(searchTerm, pageNum, LIMIT);
      setUsers(
        res.data.map((u) => ({
          id: u.id,
          username: u.username,
          avatarUrl: u.avatarUrl,
          bio: u.bio,
          isPrivate: u.isPrivate,
          status: 'NONE',
        }))
      );
      setTotal(res.total || 0);
    } catch {
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    handleSearch(query, newPage);
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <Box sx={{ maxWidth: '640px', mx: 'auto', py: 3 }}>
      <Typography variant="h5" sx={{ color: '#f4f4f5', fontWeight: 700, mb: 2 }}>
        Search Users
      </Typography>

      <TextField
        fullWidth
        placeholder="Search by username or email..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start" sx={{ color: '#71717a' }}>
                <SearchIcon size={20} />
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 3 }}
      />

      <Paper
        sx={{
          p: 2,
          bgcolor: '#18181b',
          border: '1px solid #27272a',
          borderRadius: 3,
          minHeight: '440px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ flex: 1 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={32} sx={{ color: '#0095f6' }} />
            </Box>
          ) : users.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Users size={36} color="#3f3f46" style={{ marginBottom: '8px' }} />
              <Typography variant="body2" sx={{ color: '#a1a1aa' }}>
                {query ? 'No users found' : 'Enter a query to search for people'}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {users.map((user) => (
                <UserListItem key={user.id} user={user} />
              ))}
            </Box>
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            mt: 'auto',
            pt: 2,
            borderTop: '1px solid #27272a',
          }}
        >
          <Typography variant="caption" sx={{ color: '#71717a' }}>
            {total > 0
              ? `Showing ${(page - 1) * LIMIT + 1}–${Math.min(page * LIMIT, total)} of ${total} users`
              : 'No results'}
          </Typography>

          <Pagination
            count={Math.max(1, totalPages)}
            page={page}
            onChange={(_, value) => handlePageChange(value)}
            disabled={totalPages <= 1}
            shape="rounded"
            size="medium"
            sx={{
              '& .MuiPaginationItem-root': {
                color: '#a1a1aa',
                borderColor: '#27272a',
                borderRadius: 2,
                fontSize: '0.875rem',
                '&:hover': {
                  bgcolor: '#27272a',
                  color: '#f4f4f5',
                },
                '&.Mui-selected': {
                  bgcolor: '#0095f6',
                  color: '#ffffff',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: '#1877f2',
                  },
                },
                '&.Mui-disabled': {
                  opacity: 0.4,
                  color: '#52525b',
                },
              },
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
};

