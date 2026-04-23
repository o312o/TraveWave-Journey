# Security Specification - Precision Trading System

## 1. Data Invariants
- A trade must belong to a valid user.
- Users can only read and write their own data (trades, settings, profile).
- Trade timestamps must be validated against server time.
- Numeric fields (prices, PnL) must be within sane bounds.
- IDs must be alphanumeric and limited in size.

## 2. The "Dirty Dozen" Payloads (Denial Tests)

1. **Identity Theft**: Update `trade.userId` to a different UID.
2. **Shadow Field Injection**: Create a user profile with `isAdmin: true` or `isVerified: true`.
3. **Price Manipulation**: Create a trade with negative `entryPrice`.
4. **ID Poisoning**: Create a document with a 2KB junk string as the ID.
5. **Denial of Wallet**: Update `notes` with a 1MB string to exceed storage limits/costs.
6. **Time Spoofing**: Set `timestamp` to a future date instead of `request.time`.
7. **Privilege Escalation**: Attempt to read another user's `risk` settings.
8. **Relational Sync Break**: Delete a user but leave orphaned trades (if checkable).
9. **Mutation Gap**: Update an immutable field like `createdAt`.
10. **Array Poisoning**: Pass a huge array of junk metadata to a trade.
11. **Type Bomb**: Send a string where a number is expected (e.g. `pnl: "lots"`).
12. **Unauthorized Listing**: Attempt to query all trades without a `userId` filter.

## 3. Test Runner (Mock Tests)
- `test('unauthenticated users cannot read anything')`
- `test('users cannot read other users trades')`
- `test('users cannot write trades with incorrect userId')`
- `test('users cannot exceed string size limits on notes')`
- `test('users cannot update immutable fields')`
... and so on.
