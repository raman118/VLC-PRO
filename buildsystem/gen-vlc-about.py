#!/usr/bin/env python3
import argparse

parser = argparse.ArgumentParser()
# Input file
parser.add_argument("copying", type=argparse.FileType('r', encoding='UTF-8'))
# Output files
parser.add_argument("output", type=argparse.FileType('w', encoding='UTF-8'))
args = parser.parse_args()

output_str = '/* Automatically generated file - DO NOT EDIT */\n\n'

with args.copying:
    output_str += 'static const char psz_license[] =\n"'
    output_str += args.copying.read().replace('"', '\\"').replace('\r', '').replace('\n', '\\n"\n"')
    output_str += '";\n\n'

output_str += 'static const char psz_thanks[] = "";\n\n'
output_str += 'static const char psz_authors[] = "";\n\n'

with args.output:
    args.output.write(output_str)
