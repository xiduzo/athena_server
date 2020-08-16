export const typeDefs = `
  
  directive @hasScope(scopes: [String]) on OBJECT | FIELD_DEFINITION
  directive @hasRole(roles: [Role]) on OBJECT | FIELD_DEFINITION
  directive @isAuthenticated on OBJECT | FIELD_DEFINITION
  directive @createdAt on FIELD_DEFINITION

  enum Role {
    reader
    user
    admin
    testRole
  }

  type Translation  {
    id: String!
    language: String!
    text: String!
  }

  type DateRange {
    start: Date!
    end: Date!
  }

  type User {
    id: String!
    email: String!
    displayName: String!
    avatarStyle: String!
    identityProviderReferenceNumber: String!
    squads: [Squad] @relation(name: "IS_MEMBER_OF", direction: "OUT")
    mentors: [Squad] @relation(name: "IS_MENTOR_OF", direction: "OUT")
    tribes: [Tribe] @relation(name: "IS_LEADER_OF", direction: "OUT")
  }

  type Feedback {
    id: String!
    from: User @relation(name: "GAVE", direction: "IN")
    to: User @relation(name: "TO", direction: "OUT")
    agreement: Agreement @relation(name: "ON", direction: "OUT")
    rating: Float!
    weekNum: Int!
  }

  type Agreement @isAuthenticated {
    id: String!
    type: Int!
    isBase: Boolean!
    points: Int!
    parent: Agreement @relation(name: "IS_CHILD_OF", direction: "OUT")
    children: [Agreement] @relation(name: "IS_CHILD_OF", direction: "IN")
    translations: [Translation] @relation(name: "TRANSLATES_TO", direction: "OUT")
    feedback: [Feedback] @relation(name: "ON", direction: "IN")
  }

  type Squad {
    id: String!
    name: String!
    agreements: [Agreement] @relation(name: "HAS_AGREED_TO", direction: "OUT")
    members: [User] @relation(name: "IS_MEMBER_OF", direction: "IN")
    mentors: [User] @relation(name: "IS_MENTOR_OF", direction: "IN")
    tribe: Tribe @relation(name: "IS_PART_OF", direction: "OUT")
  }

  type Tribe {
    id: String!
    name: String!
    squads: [Squad] @relation(name: "IS_PART_OF", direction: "IN")
    leaders: [User] @relation(name: "IS_LEADER_OF", direction: "IN")
    start: Date!
    end: Date!
    breaks: [DateRange]
  }
`
