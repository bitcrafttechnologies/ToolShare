import { notFound } from "next/navigation";
import { Layout, Components, type ToolCategory } from "@toolshare/ui";
const { Container, Section, Stack, Cluster, Grid } = Layout;
const {
  Separator,
  Button,
  Avatar,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  SearchInput,
  Label,
  ToolCard,
  ToolListItem,
  StatusBadge,
  VerifiedBadge,
  CategoryTag,
  Rating,
} = Components;

const ALL_CATEGORIES: ToolCategory[] = [
  "power-tools",
  "hand-tools",
  "landscaping",
  "concrete",
  "automotive",
  "plumbing",
  "electrical",
  "trailers",
  "aerial",
  "welding",
];

/**
 * Living style guide for the ToolShare design system — not a real screen.
 * Kept for local reference but hidden in production so pilot testers can't
 * stumble onto it.
 */
export default function Home() {
  if (process.env.NODE_ENV === 'production') notFound();
  return (
    <Container size="lg">
      <Section spacing="lg">
        <Stack gap={2}>
          <h1>ToolShare design system</h1>
          <p className="text-muted-foreground max-w-xl">
            A living reference for the tokens and components that power
            ToolShare across web and mobile.
          </p>
        </Stack>
      </Section>

      <Section spacing="default">
        <h2 className="mb-4">Status &amp; trust</h2>
        <Cluster gap={3}>
          <StatusBadge status="available" />
          <StatusBadge status="borrowed" />
          <StatusBadge status="pending" />
          <StatusBadge status="overdue" />
          <VerifiedBadge />
        </Cluster>
      </Section>

      <Section spacing="default">
        <h2 className="mb-4">Categories</h2>
        <Cluster gap={2}>
          {ALL_CATEGORIES.map((c) => (
            <CategoryTag key={c} category={c} />
          ))}
        </Cluster>
      </Section>

      <Section spacing="default">
        <h2 className="mb-4">Buttons</h2>
        <Cluster gap={3}>
          <Button variant="primary">Request to borrow</Button>
          <Button variant="secondary">Confirm</Button>
          <Button variant="outline">Cancel</Button>
          <Button variant="ghost">Skip</Button>
          <Button variant="destructive">Remove listing</Button>
          <Button variant="link">Learn more</Button>
        </Cluster>
      </Section>

      <Section spacing="default">
        <h2 className="mb-4">Form elements</h2>
        <Grid cols={2}>
          <Stack gap={2}>
            <Label htmlFor="demo-search">Search</Label>
            <SearchInput id="demo-search" />
          </Stack>
          <Stack gap={2}>
            <Label htmlFor="demo-name">Tool name</Label>
            <Input id="demo-name" placeholder="e.g. Cordless drill" />
          </Stack>
        </Grid>
      </Section>

      <Section spacing="default">
        <h2 className="mb-4">Avatars &amp; rating</h2>
        <Cluster gap={4}>
          <Avatar name="Sam Rivera" verified size="lg" />
          <Avatar name="Jordan Lee" size="lg" />
          <Rating value={4.5} count={23} />
        </Cluster>
      </Section>

      <Section spacing="default">
        <h2 className="mb-4">Cards</h2>
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Borrowing made simple</CardTitle>
            <CardDescription>
              A base Card composing header, content, and footer slots.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Domain components like ToolCard build on this primitive.
            </p>
          </CardContent>
        </Card>
      </Section>

      <Section spacing="default">
        <h2 className="mb-4">ToolCard</h2>
        <Grid cols={3}>
          <ToolCard
            title="Cordless Drill"
            category="power-tools"
            status="available"
            price={8}
            deposit={50}
            distance="0.4 mi away"
            owner={{ name: "Sam Rivera", verified: true, rating: 4.8, reviewCount: 32 }}
          />
          <ToolCard
            title="Wheelbarrow"
            category="landscaping"
            status="available"
            distance="1.1 mi away"
            owner={{ name: "Jordan Lee", rating: 4.2, reviewCount: 9 }}
          />
          <ToolCard
            title="Tile Saw"
            category="concrete"
            status="borrowed"
            price={25}
            isOwner
            owner={{ name: "You" }}
          />
        </Grid>
      </Section>

      <Section spacing="default">
        <h2 className="mb-4">ToolListItem</h2>
        <Stack gap={3}>
          <ToolListItem
            title="Cordless Drill"
            category="power-tools"
            status="available"
            price={8}
          />
          <ToolListItem
            title="Wheelbarrow"
            category="landscaping"
            status="available"
          />
        </Stack>
      </Section>

      <Separator className="my-8" />
    </Container>
  );
}
