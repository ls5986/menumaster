export interface IndividualBlank {
  answer: string;
  alternatives: string[];
}

export interface DescriptionLine {
  full_text: string;
  context: string;
  individual_blanks: IndividualBlank[];
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'inactive';
  description_lines: DescriptionLine[];
}

export interface TestableComponent {
  underline_text: string;
  answer: string;
  alternatives?: string[];
  hint?: string;
  individual_blanks?: IndividualBlank[];
}

export interface TestableMenuItem {
  item_name: string;
  category: string;
  components: TestableComponent[];
  status: 'active' | 'inactive';
}

export interface ParsedMenuItem {
  type: string;
  name: string;
  ingredients: string[];
  status?: 'active' | 'inactive';
}

export interface MenuData {
  sushi_selections: ParsedMenuItem[];
  sushi_ingredients: ParsedMenuItem[];
  sushi_sauces: ParsedMenuItem[];
  soups_and_salads: ParsedMenuItem[];
  dressings: ParsedMenuItem[];
}

export interface QuestionItem {
  id: string;
  itemName: string;
  category: string;
  component: TestableComponent & {
    full_text?: string;
    individual_blanks?: IndividualBlank[];
  };
  status: 'active' | 'inactive';
}

