# Security Specification: Firestore
## Data Invariants
1. Products: A product must belong to a specific user (uid).
2. History: A history item must belong to a user (userId). It can optionally reference an agency owner.
3. Users: Only the user can view/update their own profile EXCEPT for the role/tokens fields, which shouldn't be spoofable on creation. Wait, users should only be created when they don't exist. Their role should default strictly.
4. BrandKits: A brand kit belongs to a user (userId).
5. TokenTransaction: Represents a token change. Must belong to a user (userId). Immutable.
6. AgencyTeam: Belongs to an agencyOwner (agencyId). Describes an invited member (email).

## "Dirty Dozen" Payloads
1. (users) Payload setting `role: "admin"` for a normal user.
2. (users) Spoofing another user's UID.
3. (products) Injecting 2MB string into Description.
4. (history) Trying to pass an invalid type not in the enum.
5. (history) Changing `userId` after creation (Shadow update).
6. (tokenTransactions) Modifying a transaction after it's created.
7. (agencyTeams) Making oneself an "admin" of a team without being the owner.
8. (brandKits) Saving a kit with no 'industry' (missing required schema).
9. (products) Attempting to read another user's product.
10. (users) Modifying immutable `tokens` field through standard client API instead of secure backend logic (or restricting to 50 on initial creation).
11. (brandKits) Putting an invalid format in active status.

