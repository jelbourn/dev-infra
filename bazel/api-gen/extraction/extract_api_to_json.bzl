load("@build_bazel_rules_nodejs//:providers.bzl", "run_node")

def _extract_api_to_json(ctx):
    """Implementation of the extract_api_to_json rule"""

    # Define arguments that will be passed to the underlying nodejs program.
    args = ctx.actions.args()

    # Pass the module_name for the extracted APIs. This will be something like "@angular/core".
    args.add(ctx.attr.module_name)

    # Pass the entry_point for from which to extract public symbols.
    args.add(ctx.file.entry_point)

    # Pass the set of source files from which API reference data will be extracted.
    args.add_joined(ctx.files.srcs, join_with = ",")

    # Pass the name of the output JSON file.
    json_output = ctx.outputs.output_name
    args.add(json_output.path)

    # Pass the import path map
    # TODO: consider module_mappings_aspect to deal with path mappings instead of manually
    # specifying them
    # https://github.com/bazelbuild/rules_nodejs/blob/5.x/internal/linker/link_node_modules.bzl#L236
    path_map = {}
    for target, path in ctx.attr.import_map.items():
        files = target.files.to_list()
        if len(files) != 1:
            fail("Expected a single file in import_map target %s" % target.label)
        path_map[path] = files[0].path
    args.add(json.encode(path_map))

    # Define an action that runs the nodejs_binary executable. This is
    # the main thing that this rule does.
    run_node(
        ctx = ctx,
        inputs = depset(ctx.files.srcs),
        executable = "_extract_api_to_json",
        outputs = [json_output],
        arguments = [args],
    )

    # The return value describes what the rule is producing. In this case we need to specify
    # the "DefaultInfo" with the output JSON files.
    return [DefaultInfo(files = depset([json_output]))]

extract_api_to_json = rule(
    # Point to the starlark function that will execute for this rule.
    implementation = _extract_api_to_json,
    doc = """Rule that extracts Angular API reference information from TypeScript
             sources and write it to a JSON file""",

    # The attributes that can be set to this rule.
    attrs = {
        "srcs": attr.label_list(
            doc = """The source files for this rule. This must include one or more
                    TypeScript files.""",
            allow_empty = False,
            allow_files = True,
        ),
        "output_name": attr.output(
            doc = """Name of the JSON output file.""",
        ),
        "entry_point": attr.label(
            doc = """Source file entry-point from which to extract public symbols""",
            mandatory = True,
            allow_single_file = True,
        ),
        "import_map": attr.label_keyed_string_dict(
            doc = """Map of import path to the index.ts file for that import""",
            allow_files = True,
        ),
        "module_name": attr.string(
            doc = """JS Module name to be used for the extracted symbols""",
            mandatory = True,
        ),

        # The executable for this rule (private).
        "_extract_api_to_json": attr.label(
            default = Label("//bazel/api-gen/extraction:extract_api_to_json"),
            executable = True,
            cfg = "exec",
        ),
    },
)
