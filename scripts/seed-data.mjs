// Real competition-math content for SFMA. Authored once; consumed by
// scripts/seed.mjs (Supabase API) and scripts/generate-sql.mjs (seed.sql).
//
// NOTE: markdown strings use String.raw so LaTeX backslashes survive verbatim.
// Avoid the literal two-character sequence "${" inside these strings.

const R = String.raw;

export const tracks = [
  /* ============================================================= AMC 8 */
  {
    title: "AMC 8",
    slug: "amc-8",
    description:
      "A rigorous foundation in number theory, counting, algebra, and geometry for the AMC 8.",
    order_index: 0,
    modules: [
      {
        title: "Number Theory",
        slug: "number-theory",
        description: "Divisibility, primes, and the integers.",
        order_index: 0,
        lessons: [
          {
            title: "Divisibility Rules",
            slug: "divisibility-rules",
            order_index: 0,
            author: "Siyong Huang",
            frequency: "essential",
            blocks: [
              { type: "section", title: "Introduction" },
              {
                type: "text",
                content: R`A **divisibility rule** is a shortcut for deciding whether one integer divides another without doing long division. On the AMC 8, these rules turn slow arithmetic into a few seconds of mental work.

We write $a \mid b$ ("$a$ divides $b$") when $b$ is a multiple of $a$ — that is, when there is an integer $k$ with $b = ak$.`,
              },
              {
                type: "text",
                content: R`### The core rules

For a positive integer $n$ written in base ten:

- **Divisible by 2** — the last digit is even.
- **Divisible by 5** — the last digit is $0$ or $5$.
- **Divisible by 10** — the last digit is $0$.
- **Divisible by 4** — the number formed by the **last two** digits is divisible by $4$.
- **Divisible by 8** — the number formed by the **last three** digits is divisible by $8$.
- **Divisible by 3** — the **digit sum** is divisible by $3$.
- **Divisible by 9** — the digit sum is divisible by $9$.
- **Divisible by 6** — divisible by both $2$ and $3$.

For example, $7{,}128$ is divisible by $9$ because $7+1+2+8 = 18$, and $9 \mid 18$.`,
              },
              {
                type: "text",
                content: R`### Why the rule for 3 and 9 works

Every power of ten leaves a remainder of $1$ when divided by $9$, since
$$10 \equiv 1 \pmod 9 \implies 10^k \equiv 1^k = 1 \pmod 9.$$
So a number $\overline{d_k \cdots d_1 d_0} = \sum_i d_i \cdot 10^i$ satisfies
$$\sum_i d_i \cdot 10^i \equiv \sum_i d_i \pmod 9.$$
The number and its digit sum are congruent mod $9$ (and hence mod $3$), which is exactly the divisibility rule. The same idea with $10 \equiv 0 \pmod{2,5,10}$ explains the last-digit rules.`,
              },
              {
                type: "resource",
                source: "AoPS",
                stars: 5,
                title: "Divisibility Rules",
                description:
                  "A comprehensive reference covering every standard rule, with proofs and examples.",
                url: "https://artofproblemsolving.com/wiki/index.php/Divisibility_rules",
              },
              { type: "section", title: "Practice Problems" },
              {
                type: "problem",
                title: "Smallest common multiple",
                source: "AMC 8 (practice)",
                difficulty: "Easy",
                statement: R`What is the smallest positive integer that is divisible by each of $2,\ 3,\ 4,\ 5,$ and $6$?`,
                hint: R`The answer must be a multiple of the **least common multiple** of these numbers. Build it from prime factors.`,
                solution: R`Take the highest power of each prime appearing: $2^2$ (from $4$), $3$, and $5$. So
$$\operatorname{lcm}(2,3,4,5,6) = 2^2 \cdot 3 \cdot 5 = 60.$$
The answer is $\boxed{60}$.`,
              },
              {
                type: "problem",
                title: "Finding a missing digit",
                source: "AMC 8 (practice)",
                difficulty: "Easy",
                statement: R`The four-digit number $\overline{72A6}$ is divisible by $3$. What is the sum of all possible values of the digit $A$?`,
                hint: R`Use the digit-sum rule for $3$. Which residues of $A$ make the total a multiple of $3$?`,
                solution: R`The digit sum is $7+2+A+6 = 15 + A$. Since $15$ is already a multiple of $3$, we need $3 \mid A$. The digits $A \in \{0,3,6,9\}$ work, and their sum is
$$0+3+6+9 = 18.$$`,
              },
              {
                type: "problem",
                title: "Divisible by 36",
                source: "AMC 8 (practice)",
                difficulty: "Medium",
                statement: R`The number $\overline{5A6B}$ is divisible by $36$. Given that it is divisible by $36$, what is the largest possible value of the number?`,
                hint: R`$36 = 4 \cdot 9$ with $\gcd(4,9)=1$. A number is divisible by $36$ exactly when it is divisible by **both** $4$ and $9$. Apply each rule to pin down $A$ and $B$.`,
                solution: R`Divisibility by $4$ depends on the last two digits $\overline{6B}$: we need $4 \mid \overline{6B}$, so $B \in \{0,4,8\}$.

Divisibility by $9$ needs $5 + A + 6 + B = 11 + A + B \equiv 0 \pmod 9$, i.e. $A + B \equiv 7 \pmod 9$.

To maximize $\overline{5A6B}$ we want $A$ as large as possible. Trying $A = 9$ gives $B \equiv 7 - 9 \equiv -2 \equiv 7 \pmod 9$, so $B=7$ — but $7 \notin \{0,4,8\}$. Trying $A=8$ gives $B \equiv -1 \equiv 8$, and $B=8$ is allowed. This yields
$$\overline{5A6B} = 5868,$$
and indeed $5868 = 36 \cdot 163$. The largest value is $\boxed{5868}$.`,
              },
            ],
          },
        ],
      },
      {
        title: "Combinatorics",
        slug: "combinatorics",
        description: "Counting without listing.",
        order_index: 1,
        lessons: [
          {
            title: "Counting Principles",
            slug: "counting-principles",
            order_index: 0,
            author: "Benjamin Qi",
            frequency: "essential",
            blocks: [
              { type: "section", title: "Introduction" },
              {
                type: "text",
                content: R`Most counting problems reduce to two ideas: when do we **multiply**, and when do we **add**? Getting this right is the whole game on the AMC 8.`,
              },
              { type: "section", title: "The Multiplication Principle" },
              {
                type: "text",
                content: R`If a task splits into a sequence of independent stages, with $a$ choices for the first stage, $b$ for the second, and so on, then the number of ways to complete the whole task is the **product**
$$a \times b \times \cdots.$$

**Example.** An ice-cream shop has $4$ flavors and $3$ toppings. A scoop-with-topping can be made in
$$4 \times 3 = 12$$
ways, because each of the $4$ flavors pairs with each of the $3$ toppings.`,
              },
              { type: "section", title: "The Addition Principle" },
              {
                type: "text",
                content: R`If a task can be done in one of several **mutually exclusive** ways — cases that never overlap — then the total count is the **sum** of the counts of each case.

**Example.** To travel from $A$ to $B$ you may take one of $3$ bus routes **or** one of $2$ train routes. Since you pick exactly one mode, there are
$$3 + 2 = 5$$
ways. We add because the bus and train options do not overlap.

The guiding question: *are the options happening together (multiply) or instead of each other (add)?*`,
              },
              {
                type: "resource",
                source: "CPH",
                stars: 4,
                title: "Counting — Competitive Programmer's Handbook",
                description:
                  "A crisp treatment of the multiplication and addition rules with worked examples.",
                url: "https://cses.fi/book/book.pdf",
              },
              { type: "section", title: "Practice Problems" },
              {
                type: "problem",
                title: "License plates",
                source: "AMC 8 (practice)",
                difficulty: "Easy",
                statement: R`A license plate has $2$ letters (A–Z) followed by $3$ digits (0–9), with repeats allowed. How many different plates are possible?`,
                hint: R`Each position is an independent stage — multiply the number of choices.`,
                solution: R`There are $26$ choices for each letter and $10$ for each digit:
$$26 \times 26 \times 10 \times 10 \times 10 = 676 \times 1000 = 676{,}000.$$`,
              },
              {
                type: "problem",
                title: "Paths on a grid",
                source: "AMC 8 (practice)",
                difficulty: "Medium",
                statement: R`Starting at the bottom-left corner of a $3 \times 3$ grid of streets, you walk to the top-right corner moving only **right** or **up**. How many shortest paths are there?`,
                hint: R`Every shortest path is a rearrangement of $3$ R's and $3$ U's. Count the arrangements.`,
                solution: R`A path is a sequence of $3$ rights and $3$ ups, so we choose which $3$ of the $6$ steps are "right":
$$\binom{6}{3} = \frac{6!}{3!\,3!} = 20.$$`,
              },
              {
                type: "problem",
                title: "At least one even",
                source: "AMC 8 (practice)",
                difficulty: "Medium",
                statement: R`A three-digit code uses digits $1$ through $6$, repeats allowed. How many codes contain **at least one** even digit?`,
                hint: R`Complementary counting: total minus the codes with **no** even digit.`,
                solution: R`There are $6^3 = 216$ codes in all. Codes using only the odd digits $\{1,3,5\}$ number $3^3 = 27$. So the codes with at least one even digit total
$$216 - 27 = 189.$$`,
              },
            ],
          },
        ],
      },
    ],
  },

  /* ========================================================= AMC 10/12 */
  {
    title: "AMC 10/12",
    slug: "amc-10-12",
    description:
      "Algebra, number theory, geometry, and contest tactics for the AMC 10 and AMC 12.",
    order_index: 1,
    modules: [
      {
        title: "Algebra",
        slug: "algebra",
        description: "Polynomials and their structure.",
        order_index: 0,
        lessons: [
          {
            title: "Vieta's Formulas",
            slug: "vietas-formulas",
            order_index: 0,
            author: "Ryan Chou",
            frequency: "important",
            blocks: [
              { type: "section", title: "Introduction" },
              {
                type: "text",
                content: R`**Vieta's formulas** relate the coefficients of a polynomial to symmetric functions of its roots. They let you compute sums and products of roots *without ever solving the equation* — a recurring shortcut on the AMC 10/12.`,
              },
              { type: "section", title: "The Quadratic Case" },
              {
                type: "text",
                content: R`Suppose the quadratic $ax^2 + bx + c$ has roots $r$ and $s$. Then it factors as
$$a(x - r)(x - s) = ax^2 - a(r+s)x + a\,rs.$$
Matching coefficients gives
$$r + s = -\frac{b}{a}, \qquad rs = \frac{c}{a}.$$`,
              },
              { type: "section", title: "The General Formula" },
              {
                type: "text",
                content: R`For a monic polynomial
$$x^n + c_{n-1}x^{n-1} + \cdots + c_1 x + c_0$$
with roots $r_1, \dots, r_n$, Vieta's formulas say the $k$-th **elementary symmetric sum** of the roots equals $(-1)^k c_{n-k}$. The two most useful cases:
$$\sum_i r_i = -c_{n-1}, \qquad \prod_i r_i = (-1)^n c_0.$$

For a cubic $x^3 + px^2 + qx + r$ with roots $a,b,c$:
$$a+b+c = -p, \quad ab+bc+ca = q, \quad abc = -r.$$`,
              },
              {
                type: "resource",
                source: "Art of Problem Solving",
                stars: 5,
                title: "Vieta's Formulas",
                description:
                  "Statement, proof, and a large bank of contest problems that hinge on Vieta.",
                url: "https://artofproblemsolving.com/wiki/index.php/Vieta%27s_formulas",
              },
              { type: "section", title: "Practice Problems" },
              {
                type: "problem",
                title: "Sum of squares of roots",
                source: "AMC 10/12 (practice)",
                difficulty: "Easy",
                statement: R`Let $r$ and $s$ be the roots of $x^2 - 7x + 10 = 0$. Find $r^2 + s^2$.`,
                hint: R`Use the identity $r^2 + s^2 = (r+s)^2 - 2rs$ together with Vieta.`,
                solution: R`Vieta gives $r+s = 7$ and $rs = 10$. Then
$$r^2 + s^2 = (r+s)^2 - 2rs = 49 - 20 = 29.$$`,
              },
              {
                type: "problem",
                title: "Recovering a coefficient",
                source: "AMC 10/12 (practice)",
                difficulty: "Medium",
                statement: R`The cubic $x^3 - 6x^2 + 11x - k$ has three roots whose product is $6$. What is $k$?`,
                hint: R`For $x^3 + px^2 + qx + r$, the product of the roots is $-r$.`,
                solution: R`Here the constant term is $-k$, so by Vieta the product of roots is $-(-k) = k$. Given the product is $6$, we get $k = 6$. (Indeed the roots are $1,2,3$.)`,
              },
              {
                type: "problem",
                title: "A symmetric expression",
                source: "AMC 10/12 (practice)",
                difficulty: "Hard",
                statement: R`Let $a,b,c$ be the roots of $x^3 - 3x^2 + 4x - 5 = 0$. Compute
$$\frac{1}{a} + \frac{1}{b} + \frac{1}{c}.$$`,
                hint: R`Write the sum of reciprocals over a common denominator: $\dfrac{ab+bc+ca}{abc}$.`,
                solution: R`By Vieta, $ab+bc+ca = 4$ and $abc = 5$. Therefore
$$\frac{1}{a}+\frac{1}{b}+\frac{1}{c} = \frac{ab+bc+ca}{abc} = \frac{4}{5}.$$`,
              },
            ],
          },
        ],
      },
      {
        title: "Number Theory",
        slug: "number-theory",
        description: "Congruences and the arithmetic of remainders.",
        order_index: 1,
        lessons: [
          {
            title: "Modular Arithmetic",
            slug: "modular-arithmetic",
            order_index: 0,
            author: "Andrew Wang",
            frequency: "important",
            blocks: [
              { type: "section", title: "Introduction" },
              {
                type: "text",
                content: R`**Modular arithmetic** is arithmetic with remainders. We write
$$a \equiv b \pmod m$$
to mean $m \mid (a - b)$ — that is, $a$ and $b$ leave the same remainder upon division by $m$. This single idea organizes a huge fraction of contest number theory.`,
              },
              { type: "section", title: "Properties of Congruences" },
              {
                type: "text",
                content: R`Congruences can be added, subtracted, and multiplied just like equations. If $a \equiv b \pmod m$ and $c \equiv d \pmod m$, then
$$a + c \equiv b + d, \quad a - c \equiv b - d, \quad ac \equiv bd \pmod m.$$
In particular, $a \equiv b \pmod m \implies a^k \equiv b^k \pmod m$ for every positive integer $k$.

**Caution:** you may *not* always divide. Cancelling a factor is valid only when that factor is invertible mod $m$ (i.e. coprime to $m$).`,
              },
              { type: "section", title: "A Worked Example" },
              {
                type: "text",
                content: R`*What is the remainder when $3^{100}$ is divided by $7$?*

Compute small powers mod $7$:
$$3^1 \equiv 3, \quad 3^2 \equiv 2, \quad 3^3 \equiv 6, \quad 3^4 \equiv 4, \quad 3^5 \equiv 5, \quad 3^6 \equiv 1 \pmod 7.$$
The powers cycle with period $6$. Since $100 = 6\cdot 16 + 4$,
$$3^{100} \equiv 3^{4} \equiv 4 \pmod 7.$$
The remainder is $4$.`,
              },
              {
                type: "resource",
                source: "AoPS",
                stars: 5,
                title: "Introduction to Modular Arithmetic",
                description:
                  "Definitions, the laws of congruence, and Fermat's little theorem with contest applications.",
                url: "https://artofproblemsolving.com/wiki/index.php/Modular_arithmetic",
              },
              { type: "section", title: "Practice Problems" },
              {
                type: "problem",
                title: "Last digit of a power",
                source: "AMC 10/12 (practice)",
                difficulty: "Easy",
                statement: R`What is the units digit of $7^{2024}$?`,
                hint: R`The units digit is the value mod $10$. Find the cycle length of $7^k \pmod{10}$.`,
                solution: R`The units digits of $7^1,7^2,7^3,7^4$ are $7,9,3,1$, repeating with period $4$. Since $2024 \equiv 0 \pmod 4$, we land on the end of the cycle:
$$7^{2024} \equiv 7^4 \equiv 1 \pmod{10}.$$
The units digit is $1$.`,
              },
              {
                type: "problem",
                title: "A linear congruence",
                source: "AMC 10/12 (practice)",
                difficulty: "Medium",
                statement: R`How many integers $n$ with $1 \le n \le 100$ satisfy $3n \equiv 1 \pmod 7$?`,
                hint: R`First solve for $n$ mod $7$ by finding the inverse of $3$ modulo $7$.`,
                solution: R`Since $3 \cdot 5 = 15 \equiv 1 \pmod 7$, the inverse of $3$ is $5$, so $n \equiv 5 \pmod 7$. The values $n \in \{5,12,19,\dots\}$ up to $100$ are $5 + 7k$ with $0 \le k \le 13$ (since $5 + 7\cdot 13 = 96$). That is $14$ values.`,
              },
              {
                type: "problem",
                title: "Fermat's little theorem",
                source: "AMC 10/12 (practice)",
                difficulty: "Hard",
                statement: R`Find the remainder when $2^{90}$ is divided by $11$.`,
                hint: R`Fermat's little theorem: if $p$ is prime and $p \nmid a$, then $a^{p-1} \equiv 1 \pmod p$.`,
                solution: R`Since $11$ is prime and $11 \nmid 2$, Fermat gives $2^{10} \equiv 1 \pmod{11}$. Then
$$2^{90} = \left(2^{10}\right)^{9} \equiv 1^{9} = 1 \pmod{11}.$$
The remainder is $1$.`,
              },
            ],
          },
        ],
      },
    ],
  },

  /* ===================================================== AP Calculus BC */
  {
    title: "AP Calculus BC",
    slug: "ap-calculus-bc",
    description:
      "Limits, derivatives, integrals, and series — the full AP Calculus BC curriculum.",
    order_index: 2,
    modules: [
      {
        title: "Limits and Continuity",
        slug: "limits-and-continuity",
        description: "The foundation of calculus.",
        order_index: 0,
        lessons: [
          {
            title: "Evaluating Limits",
            slug: "evaluating-limits",
            order_index: 0,
            author: "SFMA Staff",
            frequency: "essential",
            blocks: [
              { type: "section", title: "Introduction" },
              {
                type: "text",
                content: R`A **limit** describes the value a function approaches as its input approaches some point. We write
$$\lim_{x \to a} f(x) = L$$
to mean that $f(x)$ gets arbitrarily close to $L$ as $x$ gets close to $a$ (from either side). Limits are the foundation on which derivatives and integrals are built.`,
              },
              { type: "section", title: "Techniques" },
              {
                type: "text",
                content: R`**Direct substitution.** If $f$ is continuous at $a$, then $\lim_{x\to a} f(x) = f(a)$. Always try this first.

**Factoring.** When substitution gives the indeterminate form $\tfrac{0}{0}$, factor and cancel:
$$\lim_{x \to 2} \frac{x^2 - 4}{x - 2} = \lim_{x \to 2} \frac{(x-2)(x+2)}{x-2} = \lim_{x\to 2}(x+2) = 4.$$

**L'Hôpital's Rule.** For a $\tfrac{0}{0}$ or $\tfrac{\infty}{\infty}$ form,
$$\lim_{x\to a}\frac{f(x)}{g(x)} = \lim_{x\to a}\frac{f'(x)}{g'(x)},$$
provided the right-hand limit exists.`,
              },
              {
                type: "resource",
                source: "Khan Academy",
                stars: 5,
                title: "Limits and continuity",
                description:
                  "Video-based walkthroughs of every limit technique on the AP exam.",
                url: "https://www.khanacademy.org/math/ap-calculus-bc",
              },
              { type: "section", title: "Practice Problems" },
              {
                type: "problem",
                title: "A removable discontinuity",
                source: "AP Calculus BC (practice)",
                difficulty: "Easy",
                statement: R`Evaluate
$$\lim_{x \to 3} \frac{x^2 - 9}{x - 3}.$$`,
                hint: R`The form is $\tfrac{0}{0}$. Factor the numerator as a difference of squares.`,
                solution: R`Factor and cancel:
$$\frac{x^2-9}{x-3} = \frac{(x-3)(x+3)}{x-3} = x+3.$$
So the limit is $3 + 3 = 6.$`,
              },
              {
                type: "problem",
                title: "A trigonometric limit",
                source: "AP Calculus BC (practice)",
                difficulty: "Medium",
                statement: R`Evaluate
$$\lim_{x \to 0} \frac{\sin(5x)}{3x}.$$`,
                hint: R`Use the standard limit $\lim_{u\to 0}\tfrac{\sin u}{u} = 1$ after matching the argument.`,
                solution: R`Rewrite to expose $\tfrac{\sin u}{u}$ with $u = 5x$:
$$\frac{\sin 5x}{3x} = \frac{5}{3}\cdot\frac{\sin 5x}{5x} \longrightarrow \frac{5}{3}\cdot 1 = \frac{5}{3}.$$`,
              },
              {
                type: "problem",
                title: "L'Hôpital's Rule",
                source: "AP Calculus BC (practice)",
                difficulty: "Medium",
                statement: R`Evaluate
$$\lim_{x \to 0} \frac{e^x - 1 - x}{x^2}.$$`,
                hint: R`The form is $\tfrac{0}{0}$. Apply L'Hôpital's Rule twice.`,
                solution: R`Differentiating top and bottom: $\tfrac{e^x - 1}{2x}$, still $\tfrac00$. Again: $\tfrac{e^x}{2} \to \tfrac12$. So the limit is $\tfrac{1}{2}.$`,
              },
            ],
          },
        ],
      },
      {
        title: "Integration",
        slug: "integration",
        description: "Accumulation and the antiderivative.",
        order_index: 1,
        lessons: [
          {
            title: "The Fundamental Theorem of Calculus",
            slug: "fundamental-theorem-of-calculus",
            order_index: 0,
            author: "SFMA Staff",
            frequency: "important",
            blocks: [
              { type: "section", title: "Introduction" },
              {
                type: "text",
                content: R`The **Fundamental Theorem of Calculus** (FTC) ties together the two central operations of calculus — differentiation and integration — showing they are inverses of one another.`,
              },
              { type: "section", title: "The Two Parts" },
              {
                type: "text",
                content: R`**Part 1.** If $F(x) = \displaystyle\int_a^x f(t)\,dt$ with $f$ continuous, then $F$ is differentiable and
$$F'(x) = f(x).$$

**Part 2 (Evaluation).** If $F$ is any antiderivative of $f$ on $[a,b]$, then
$$\int_a^b f(x)\,dx = F(b) - F(a).$$

Part 2 turns the hard problem of summing infinitely many slices into the easy problem of evaluating an antiderivative at two endpoints.`,
              },
              {
                type: "resource",
                source: "Paul's Online Notes",
                stars: 4,
                title: "The Fundamental Theorem of Calculus",
                description:
                  "A clear statement of both parts with fully worked examples.",
                url: "https://tutorial.math.lamar.edu/classes/calci/proofintegrals.aspx",
              },
              { type: "section", title: "Practice Problems" },
              {
                type: "problem",
                title: "A definite integral",
                source: "AP Calculus BC (practice)",
                difficulty: "Easy",
                statement: R`Evaluate
$$\int_1^3 \left(2x + 1\right)\,dx.$$`,
                hint: R`Find an antiderivative, then apply Part 2: $F(3) - F(1)$.`,
                solution: R`An antiderivative is $F(x) = x^2 + x$. Then
$$F(3) - F(1) = (9 + 3) - (1 + 1) = 12 - 2 = 10.$$`,
              },
              {
                type: "problem",
                title: "Differentiating an integral",
                source: "AP Calculus BC (practice)",
                difficulty: "Medium",
                statement: R`Let $\displaystyle G(x) = \int_0^{x^2} \cos(t)\,dt$. Find $G'(x)$.`,
                hint: R`Combine FTC Part 1 with the chain rule, since the upper limit is $x^2$.`,
                solution: R`By Part 1 with the chain rule,
$$G'(x) = \cos\!\left(x^2\right)\cdot \frac{d}{dx}\!\left(x^2\right) = 2x\cos\!\left(x^2\right).$$`,
              },
              {
                type: "problem",
                title: "Area under a curve",
                source: "AP Calculus BC (practice)",
                difficulty: "Hard",
                statement: R`Find the area of the region bounded by $y = x^2$, the $x$-axis, and the lines $x = 0$ and $x = 2$.`,
                hint: R`Area equals $\int_0^2 x^2\,dx$.`,
                solution: R`The antiderivative of $x^2$ is $\tfrac{x^3}{3}$, so
$$\int_0^2 x^2\,dx = \left[\frac{x^3}{3}\right]_0^2 = \frac{8}{3} - 0 = \frac{8}{3}.$$`,
              },
            ],
          },
        ],
      },
    ],
  },
];
