#!/usr/bin/env python3
"""
register_template.py — Register a new .pptx template in the think-cell skill's templates.yaml.

Usage:
    python3 register_template.py \
        --name "AGFMA Waterfall" \
        --path "/path/to/template.pptx" \
        --category waterfall \
        --use-case "AGFMA cost-out bridge FY25–FY26" \
        --elements '[{"name": "Chart1", "type": "chart", "data_shape": "categories x signed values"}]'
"""

import argparse
import json
import os
import sys

SKILL_DIR = os.path.dirname(os.path.abspath(__file__))
REGISTRY_PATH = os.path.join(SKILL_DIR, "templates.yaml")

VALID_CATEGORIES = {"waterfall", "stacked_bar", "marimekko", "bubble", "combination", "harvey_ball"}


def main():
    parser = argparse.ArgumentParser(
        description="Register a .pptx template in the think-cell skill's templates.yaml."
    )
    parser.add_argument("--name", required=True, help="Short human label for this template.")
    parser.add_argument("--path", required=True, help="Absolute path to the .pptx file.")
    parser.add_argument(
        "--category",
        required=True,
        choices=sorted(VALID_CATEGORIES),
        help=f"Chart family. One of: {', '.join(sorted(VALID_CATEGORIES))}",
    )
    parser.add_argument("--use-case", required=True, help="Plain-English description of when to use this template.")
    parser.add_argument(
        "--elements",
        required=True,
        help='JSON array of placeholder elements. E.g.: \'[{"name": "Chart1", "type": "chart", "data_shape": "..."}]\'',
    )
    parser.add_argument(
        "--tags",
        default="",
        help="Comma-separated list of tags for matching (optional). E.g. 'waterfall,EBIT,CFO'",
    )
    args = parser.parse_args()

    # Validate .pptx path
    if not os.path.exists(args.path):
        print(f"ERROR: Template file not found: {args.path}", file=sys.stderr)
        print("  Store the .pptx in Template/thinkcell/ first.", file=sys.stderr)
        sys.exit(1)

    if not args.path.endswith(".pptx"):
        print(f"WARNING: Path does not end in .pptx — ensure this is a valid PowerPoint file.", file=sys.stderr)

    # Parse elements JSON
    try:
        elements = json.loads(args.elements)
    except json.JSONDecodeError as e:
        print(f"ERROR: Could not parse --elements as JSON: {e}", file=sys.stderr)
        sys.exit(1)

    if not isinstance(elements, list) or not elements:
        print("ERROR: --elements must be a non-empty JSON array.", file=sys.stderr)
        sys.exit(1)

    for el in elements:
        if "name" not in el or "type" not in el:
            print(f"ERROR: Each element must have 'name' and 'type' fields. Got: {el}", file=sys.stderr)
            sys.exit(1)

    # Parse tags
    tags = [t.strip() for t in args.tags.split(",") if t.strip()]
    # Always include the category as a tag
    if args.category not in tags:
        tags.insert(0, args.category)

    # Load existing registry
    try:
        import yaml
    except ImportError:
        print("ERROR: PyYAML not installed. Run: pip install pyyaml", file=sys.stderr)
        sys.exit(1)

    with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
        registry = yaml.safe_load(f)

    if not registry or "templates" not in registry:
        registry = {"templates": []}

    existing_names = [t.get("name", "") for t in registry["templates"]]
    if args.name in existing_names:
        print(f"ERROR: A template named '{args.name}' already exists in templates.yaml.", file=sys.stderr)
        print("  Choose a unique name or update the existing entry manually.", file=sys.stderr)
        sys.exit(1)

    # Build new entry
    new_entry = {
        "name": args.name,
        "path": args.path,
        "category": args.category,
        "use_case": args.use_case,
        "elements": elements,
        "tags": tags,
    }

    registry["templates"].append(new_entry)

    # Write back
    with open(REGISTRY_PATH, "w", encoding="utf-8") as f:
        yaml.dump(registry, f, default_flow_style=False, allow_unicode=True, sort_keys=False)

    print(f"OK: Template '{args.name}' registered in templates.yaml.")
    print(f"    Category : {args.category}")
    print(f"    Path     : {args.path}")
    print(f"    Elements : {', '.join(e['name'] for e in elements)}")
    print(f"    Tags     : {', '.join(tags)}")


if __name__ == "__main__":
    main()
