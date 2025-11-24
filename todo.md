# Project TODO

- [x] Database schema for shopping lists and items
- [x] Backend tRPC procedures for CRUD operations
- [x] Homepage with list overview
- [x] Create new shopping list functionality
- [x] View individual list with items
- [x] Add/edit/delete items in a list
- [x] Price comparison feature across stores
- [x] Delete shopping lists
- [x] Responsive design matching reference UI
- [x] User authentication integration
- [x] Write vitest tests for backend procedures

## Phase 2: Multilingual & Paste Features
- [x] Add stores table with location-based store data
- [x] Add list_history table for tracking past lists
- [x] Add shared_lists table for sharing functionality
- [x] Implement list paste parsing logic (split by newlines)
- [x] Create language context for i18n
- [x] Add translations for English and Hebrew
- [x] Implement paste textarea component
- [x] Add share functionality (generate shareable links)
- [x] Add history view for past lists
- [x] Implement location-based store detection
- [x] Create store comparison utilities
- [x] Add vitest tests for new features


## Phase 3: Store Comparison Dashboard
- [x] Create PriceComparison page component
- [x] Add price input form for items across stores
- [x] Build comparison table showing prices by store
- [x] Add visual indicators for cheapest/most expensive
- [x] Calculate total cost per store
- [x] Show savings percentage compared to most expensive
- [x] Create comparison utilities and calculations
- [x] Write tests for comparison calculations
- [x] Add navigation link from list detail page


## Phase 4: Location-Based Store Detection & Real Pricing
- [x] Add location field to users table
- [x] Create user settings/profile page
- [x] Implement location editing functionality
- [x] Add store detection based on user location
- [x] Display available stores for user's location
- [ ] Integrate grocery store APIs (Google Places, Yelp, or similar)
- [ ] Fetch real-time prices from detected stores
- [ ] Update comparison page to show real prices
- [ ] Add store search and filtering
- [ ] Handle API errors and fallbacks


## Phase 5: Real API Integration for Israeli Stores
- [ ] Integrate Google Places API for store discovery
- [ ] Fetch actual grocery stores based on city location
- [ ] Support major Israeli grocery chains (Rami Levy, Tiv Taam, Shufersal, etc.)
- [ ] Fetch real prices from store APIs
- [ ] Update comparison page to show actual store prices
- [ ] Handle API rate limits and caching
- [ ] Add error handling for missing stores/prices
